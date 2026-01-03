import { Request, Response } from 'express';
import { CommunitiesService } from './communities.service';
import { ResponseUtil } from '../../utils/response.util';
import {
  RequestJoinRequest,
  VerifyJoinRequest,
  RequestLeaveRequest,
  VerifyLeaveRequest,
  AddMemberRequest,
  UpdateMemberRequest,
} from './communities.types';

const communitiesService = new CommunitiesService();

export class CommunitiesController {
  /**
   * GET /admin/community-submissions
   * List all community submissions
   */
  async listSubmissions(req: Request, res: Response) {
    try {
      const status = req.query.status as 'pending' | 'approved' | 'rejected' | undefined;
      
      if (status && !['pending', 'approved', 'rejected'].includes(status)) {
        return ResponseUtil.error(res, 'Invalid status. Must be pending, approved, or rejected', 400);
      }

      const submissions = await communitiesService.listSubmissions(status);
      return ResponseUtil.success(res, { submissions }, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch submissions';
      return ResponseUtil.error(res, message, 500);
    }
  }

  /**
   * GET /admin/community-submissions/:id
   * Get single submission
   */
  async getSubmission(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const submission = await communitiesService.getSubmission(id);
      return ResponseUtil.success(res, { submission }, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch submission';
      
      if (message === 'Submission not found') {
        return ResponseUtil.error(res, message, 404);
      }
      
      return ResponseUtil.error(res, message, 500);
    }
  }

  /**
   * POST /admin/community-submissions/:id/approve
   * Approve submission and create community
   */
  async approveSubmission(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await communitiesService.approveSubmission(id);
      return ResponseUtil.success(res, {
        message: 'Community submission approved',
        ...result,
      }, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to approve submission';
      
      if (message === 'Submission not found') {
        return ResponseUtil.error(res, message, 404);
      }
      
      if (message === 'Submission has already been processed') {
        return ResponseUtil.error(res, message, 400);
      }
      
      return ResponseUtil.error(res, message, 500);
    }
  }

  /**
   * POST /admin/community-submissions/:id/reject
   * Reject submission
   */
  async rejectSubmission(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const submission = await communitiesService.rejectSubmission(id);
      return ResponseUtil.success(res, {
        message: 'Community submission rejected',
        submission,
      }, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reject submission';
      
      if (message === 'Submission not found') {
        return ResponseUtil.error(res, message, 404);
      }
      
      if (message === 'Submission has already been processed') {
        return ResponseUtil.error(res, message, 400);
      }
      
      return ResponseUtil.error(res, message, 500);
    }
  }

  /**
   * GET /admin/communities
   * List all communities
   */
  async listCommunities(req: Request, res: Response) {
    try {
      const communities = await communitiesService.listCommunities();
      return ResponseUtil.success(res, { communities }, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch communities';
      return ResponseUtil.error(res, message, 500);
    }
  }

  /**
   * GET /admin/communities/:id
   * Get single community with members
   */
  async getCommunity(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const community = await communitiesService.getCommunity(id);
      return ResponseUtil.success(res, { community }, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch community';
      
      if (message === 'Community not found') {
        return ResponseUtil.error(res, message, 404);
      }
      
      return ResponseUtil.error(res, message, 500);
    }
  }

  /**
   * GET /communities
   * Get public communities (frontend)
   */
  async getPublicCommunities(req: Request, res: Response) {
    try {
      const communities = await communitiesService.getPublicCommunities();
      return ResponseUtil.success(res, { communities }, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch communities';
      return ResponseUtil.error(res, message, 500);
    }
  }

  /**
   * GET /communities/:slug
   * Get single public community by slug (frontend)
   */
  async getPublicCommunityBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const community = await communitiesService.getPublicCommunityBySlug(slug);
      return ResponseUtil.success(res, { community }, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch community';
      
      if (message === 'Community not found') {
        return ResponseUtil.error(res, message, 404);
      }
      
      return ResponseUtil.error(res, message, 500);
    }
  }

  // ========== MEMBER MANAGEMENT ==========

  /**
   * POST /communities/:communityId/join/request
   * Request to join community (public endpoint)
   */
  async requestJoin(req: Request, res: Response) {
    try {
      const { communityId } = req.params;
      const { name, email } = req.body as Omit<RequestJoinRequest, 'communityId'>;

      if (!name || !email) {
        return ResponseUtil.error(res, 'Name and email are required', 400);
      }

      const result = await communitiesService.requestJoin({ communityId, name, email });
      return ResponseUtil.success(res, result, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process request';
      
      if (message === 'Community not found') {
        return ResponseUtil.error(res, message, 404);
      }

      if (message === 'Already a member of this community') {
        return ResponseUtil.error(res, message, 400);
      }
      
      return ResponseUtil.error(res, message, 500);
    }
  }

  /**
   * POST /communities/:communityId/join/verify
   * Verify OTP and join community (public endpoint)
   */
  async verifyJoin(req: Request, res: Response) {
    try {
      const { communityId } = req.params;
      const { email, otp } = req.body as Omit<VerifyJoinRequest, 'communityId'>;

      if (!email || !otp) {
        return ResponseUtil.error(res, 'Email and OTP are required', 400);
      }

      const result = await communitiesService.verifyJoin({ communityId, email, otp });
      return ResponseUtil.success(res, result, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to verify';
      
      if (message === 'Invalid verification code' || message === 'Verification code has expired') {
        return ResponseUtil.error(res, message, 400);
      }

      if (message === 'Community not found') {
        return ResponseUtil.error(res, message, 404);
      }
      
      return ResponseUtil.error(res, message, 500);
    }
  }

  /**
   * POST /communities/:communityId/leave/request
   * Request to leave community (public endpoint)
   */
  async requestLeave(req: Request, res: Response) {
    try {
      const { communityId } = req.params;
      const { email } = req.body as Omit<RequestLeaveRequest, 'communityId'>;

      if (!email) {
        return ResponseUtil.error(res, 'Email is required', 400);
      }

      const result = await communitiesService.requestLeave({ communityId, email });
      return ResponseUtil.success(res, result, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process request';
      
      if (message === 'Not a member of this community') {
        return ResponseUtil.error(res, message, 404);
      }
      
      return ResponseUtil.error(res, message, 500);
    }
  }

  /**
   * POST /communities/:communityId/leave/verify
   * Verify OTP and leave community (public endpoint)
   */
  async verifyLeave(req: Request, res: Response) {
    try {
      const { communityId } = req.params;
      const { email, otp } = req.body as Omit<VerifyLeaveRequest, 'communityId'>;

      if (!email || !otp) {
        return ResponseUtil.error(res, 'Email and OTP are required', 400);
      }

      const result = await communitiesService.verifyLeave({ communityId, email, otp });
      return ResponseUtil.success(res, result, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to verify';
      
      if (message === 'Invalid verification code' || message === 'Verification code has expired') {
        return ResponseUtil.error(res, message, 400);
      }
      
      return ResponseUtil.error(res, message, 500);
    }
  }

  /**
   * POST /admin/communities/:id/members
   * Admin: Add member directly (no OTP)
   */
  async addMember(req: Request, res: Response) {
    try {
      const { id: communityId } = req.params;
      const data = req.body as AddMemberRequest;

      if (!data.name || !data.email) {
        return ResponseUtil.error(res, 'Name and email are required', 400);
      }

      const member = await communitiesService.addMember(communityId, data);
      return ResponseUtil.success(res, { 
        message: 'Member added successfully',
        member 
      }, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add member';
      
      if (message === 'Community not found') {
        return ResponseUtil.error(res, message, 404);
      }

      if (message === 'Member already exists in this community') {
        return ResponseUtil.error(res, message, 400);
      }
      
      return ResponseUtil.error(res, message, 500);
    }
  }

  /**
   * PATCH /admin/communities/:communityId/members/:memberId
   * Admin: Update member notification preference
   */
  async updateMember(req: Request, res: Response) {
    try {
      const { communityId, memberId } = req.params;
      const data = req.body as UpdateMemberRequest;

      if (typeof data.notificationsEnabled !== 'boolean') {
        return ResponseUtil.error(res, 'notificationsEnabled must be a boolean', 400);
      }

      const member = await communitiesService.updateMemberNotifications(
        communityId,
        memberId,
        data
      );

      return ResponseUtil.success(res, { 
        message: 'Member updated successfully',
        member 
      }, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update member';
      
      if (message === 'Member not found') {
        return ResponseUtil.error(res, message, 404);
      }
      
      return ResponseUtil.error(res, message, 500);
    }
  }

  /**
   * DELETE /admin/communities/:communityId/members/:memberId
   * Admin: Remove member (no OTP)
   */
  async removeMember(req: Request, res: Response) {
    try {
      const { communityId, memberId } = req.params;
      const adminId = (req as any).adminId; // From auth middleware

      const member = await communitiesService.removeMember(communityId, memberId, adminId);

      return ResponseUtil.success(res, { 
        message: 'Member removed successfully',
        member 
      }, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove member';
      
      if (message === 'Member not found') {
        return ResponseUtil.error(res, message, 404);
      }
      
      return ResponseUtil.error(res, message, 500);
    }
  }
}