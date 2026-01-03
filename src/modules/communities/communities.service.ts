import prisma from '../../config/database';
import { SlugUtil } from '../../utils/slug.util';
import { OtpUtil } from '../../utils/otp.util';
import { EmailUtil } from '../../utils/email.util';
import { env } from '../../config/env';
import {
  CreateCommunitySubmissionRequest,
  ApproveSubmissionResponse,
  RequestJoinRequest,
  VerifyJoinRequest,
  RequestLeaveRequest,
  VerifyLeaveRequest,
  AddMemberRequest,
  UpdateMemberRequest,
} from './communities.types';

export class CommunitiesService {
  /**
   * List all community submissions
   */
  async listSubmissions(status?: 'pending' | 'approved' | 'rejected') {
    return prisma.communitySubmission.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get single community submission by ID
   */
  async getSubmission(id: string) {
    const submission = await prisma.communitySubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    return submission;
  }

  /**
   * Approve community submission
   * Creates community and adds organizer as first member
   */
  async approveSubmission(id: string): Promise<ApproveSubmissionResponse> {
    const submission = await prisma.communitySubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    if (submission.status !== 'pending') {
      throw new Error('Submission has already been processed');
    }

    // Generate unique slug
    const slug = await SlugUtil.generateUnique(
      submission.communityName,
      async (slug) => {
        const existing = await prisma.community.findUnique({ where: { slug } });
        return !!existing;
      }
    );

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Update submission status
      const updatedSubmission = await tx.communitySubmission.update({
        where: { id },
        data: { status: 'approved' },
      });

      // Create community
      const community = await tx.community.create({
        data: {
          name: submission.communityName,
          slug,
          description: submission.description,
        },
      });

      // Add organizer as first member with notifications enabled
      const member = await tx.communityMember.create({
        data: {
          communityId: community.id,
          name: submission.organizerName,
          email: submission.organizerEmail,
          notificationsEnabled: true,
        },
      });

      return { updatedSubmission, community, member };
    });

    return {
      submission: result.updatedSubmission,
      community: result.community,
      member: result.member,
    };
  }

  /**
   * Reject community submission
   */
  async rejectSubmission(id: string) {
    const submission = await prisma.communitySubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    if (submission.status !== 'pending') {
      throw new Error('Submission has already been processed');
    }

    return prisma.communitySubmission.update({
      where: { id },
      data: { status: 'rejected' },
    });
  }

  /**
   * List all communities (admin view)
   */
  async listCommunities() {
    return prisma.community.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            members: {
              where: {
                deletedAt: null, // Only count active members
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get single community by ID (admin view)
   */
  async getCommunity(id: string) {
    const community = await prisma.community.findUnique({
      where: { id },
      include: {
        members: {
          where: {
            deletedAt: null, // Only return active members
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!community) {
      throw new Error('Community not found');
    }

    return community;
  }

  /**
   * Get public communities (frontend)
   */
  async getPublicCommunities() {
    return prisma.community.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        createdAt: true,
        _count: {
          select: {
            members: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get single public community by slug (frontend)
   */
  async getPublicCommunityBySlug(slug: string) {
    const community = await prisma.community.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        createdAt: true,
        _count: {
          select: {
            members: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    if (!community) {
      throw new Error('Community not found');
    }

    return community;
  }

  // ========== MEMBER MANAGEMENT ==========

  /**
   * Request to join community (send OTP)
   */
  async requestJoin(data: RequestJoinRequest) {
    const { communityId, name, email } = data;

    // Check if community exists
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      throw new Error('Community not found');
    }

    // Check if already a member
    const existingMember = await prisma.communityMember.findUnique({
      where: {
        communityId_email: {
          communityId,
          email,
        },
      },
    });

    if (existingMember && !existingMember.deletedAt) {
      throw new Error('Already a member of this community');
    }

    // Generate OTP
    const otp = OtpUtil.generate();
    const expiresAt = OtpUtil.getExpiryTime(env.OTP_EXPIRY_MINUTES);

    // Save OTP
    await prisma.communityOtp.create({
      data: {
        communityId,
        email,
        name,
        otp,
        action: 'join',
        expiresAt,
      },
    });

    // Send email
    await EmailUtil.sendJoinOtp(email, name, community.name, otp);

    return { message: 'Verification code sent to your email' };
  }

  /**
   * Verify OTP and add member to community
   */
  async verifyJoin(data: VerifyJoinRequest) {
    const { communityId, email, otp } = data;

    // Find OTP record
    const otpRecord = await prisma.communityOtp.findFirst({
      where: {
        communityId,
        email,
        otp,
        action: 'join',
        verified: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new Error('Invalid verification code');
    }

    // Check expiration
    if (OtpUtil.isExpired(otpRecord.expiresAt)) {
      throw new Error('Verification code has expired');
    }

    // Get community
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      throw new Error('Community not found');
    }

    // Use transaction
    const result = await prisma.$transaction(async (tx) => {
      // Mark OTP as verified
      await tx.communityOtp.update({
        where: { id: otpRecord.id },
        data: {
          verified: true,
          verifiedAt: new Date(),
        },
      });

      // Check if member exists (might have been soft-deleted)
      const existingMember = await tx.communityMember.findUnique({
        where: {
          communityId_email: {
            communityId,
            email,
          },
        },
      });

      let member;

      if (existingMember) {
        // Restore soft-deleted member
        member = await tx.communityMember.update({
          where: { id: existingMember.id },
          data: {
            name: otpRecord.name || existingMember.name,
            deletedAt: null,
            deletedBy: null,
            notificationsEnabled: true,
          },
        });
      } else {
        // Create new member
        member = await tx.communityMember.create({
          data: {
            communityId,
            name: otpRecord.name!,
            email,
            notificationsEnabled: true,
          },
        });
      }

      return member;
    });

    return {
      message: 'Successfully joined community',
      member: result,
    };
  }

  /**
   * Request to leave community (send OTP)
   */
  async requestLeave(data: RequestLeaveRequest) {
    const { communityId, email } = data;

    // Check if member exists
    const member = await prisma.communityMember.findUnique({
      where: {
        communityId_email: {
          communityId,
          email,
        },
      },
      include: {
        community: true,
      },
    });

    if (!member || member.deletedAt) {
      throw new Error('Not a member of this community');
    }

    // Generate OTP
    const otp = OtpUtil.generate();
    const expiresAt = OtpUtil.getExpiryTime(env.OTP_EXPIRY_MINUTES);

    // Save OTP
    await prisma.communityOtp.create({
      data: {
        communityId,
        email,
        otp,
        action: 'leave',
        expiresAt,
      },
    });

    // Send email
    await EmailUtil.sendLeaveOtp(email, member.name, member.community.name, otp);

    return { message: 'Verification code sent to your email' };
  }

  /**
   * Verify OTP and remove member from community (self-initiated)
   */
  async verifyLeave(data: VerifyLeaveRequest) {
    const { communityId, email, otp } = data;

    // Find OTP record
    const otpRecord = await prisma.communityOtp.findFirst({
      where: {
        communityId,
        email,
        otp,
        action: 'leave',
        verified: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new Error('Invalid verification code');
    }

    // Check expiration
    if (OtpUtil.isExpired(otpRecord.expiresAt)) {
      throw new Error('Verification code has expired');
    }

    // Use transaction
    await prisma.$transaction(async (tx) => {
      // Mark OTP as verified
      await tx.communityOtp.update({
        where: { id: otpRecord.id },
        data: {
          verified: true,
          verifiedAt: new Date(),
        },
      });

      // Soft delete member
      await tx.communityMember.update({
        where: {
          communityId_email: {
            communityId,
            email,
          },
        },
        data: {
          deletedAt: new Date(),
          deletedBy: 'self',
        },
      });
    });

    return { message: 'Successfully left community' };
  }

  /**
   * Admin: Add member directly (no OTP required)
   */
  async addMember(communityId: string, data: AddMemberRequest) {
    const { name, email, notificationsEnabled = true } = data;

    // Check if community exists
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      throw new Error('Community not found');
    }

    // Check if member already exists
    const existingMember = await prisma.communityMember.findUnique({
      where: {
        communityId_email: {
          communityId,
          email,
        },
      },
    });

    if (existingMember && !existingMember.deletedAt) {
      throw new Error('Member already exists in this community');
    }

    let member;

    if (existingMember) {
      // Restore soft-deleted member
      member = await prisma.communityMember.update({
        where: { id: existingMember.id },
        data: {
          name,
          deletedAt: null,
          deletedBy: null,
          notificationsEnabled,
        },
      });
    } else {
      // Create new member
      member = await prisma.communityMember.create({
        data: {
          communityId,
          name,
          email,
          notificationsEnabled,
        },
      });
    }

    return member;
  }

  /**
   * Admin: Update member notification preference
   */
  async updateMemberNotifications(
    communityId: string,
    memberId: string,
    data: UpdateMemberRequest
  ) {
    const member = await prisma.communityMember.findFirst({
      where: {
        id: memberId,
        communityId,
        deletedAt: null,
      },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    return prisma.communityMember.update({
      where: { id: memberId },
      data: {
        notificationsEnabled: data.notificationsEnabled,
      },
    });
  }

  /**
   * Admin: Remove member (no OTP required)
   */
  async removeMember(communityId: string, memberId: string, adminId: string) {
    const member = await prisma.communityMember.findFirst({
      where: {
        id: memberId,
        communityId,
        deletedAt: null,
      },
      include: {
        community: true,
      },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    // Soft delete with admin tracking
    const deletedMember = await prisma.communityMember.update({
      where: { id: memberId },
      data: {
        deletedAt: new Date(),
        deletedBy: adminId,
      },
    });

    // Send notification email
    await EmailUtil.sendRemovalNotification(
      member.email,
      member.name,
      member.community.name
    );

    return deletedMember;
  }
}