// Community Submission
export interface CommunitySubmission {
  id: string;
  organizerName: string;
  organizerEmail: string;
  communityName: string;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

// Community
export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
}

// Community Member
export interface CommunityMember {
  id: string;
  communityId: string;
  name: string;
  email: string;
  notificationsEnabled: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  createdAt: Date;
}

// Request/Response types
export interface CreateCommunitySubmissionRequest {
  organizerName: string;
  organizerEmail: string;
  communityName: string;
  description?: string;
}

export interface ApproveSubmissionResponse {
  submission: CommunitySubmission;
  community: Community;
  member: CommunityMember;
}

// Member management types
export interface RequestJoinRequest {
  communityId: string;
  name: string;
  email: string;
}

export interface VerifyJoinRequest {
  communityId: string;
  email: string;
  otp: string;
}

export interface RequestLeaveRequest {
  communityId: string;
  email: string;
}

export interface VerifyLeaveRequest {
  communityId: string;
  email: string;
  otp: string;
}

export interface AddMemberRequest {
  name: string;
  email: string;
  notificationsEnabled?: boolean;
}

export interface UpdateMemberRequest {
  notificationsEnabled: boolean;
}