export type MentorApprovalStatus = "pending" | "approved" | "rejected" | "suspended";

export type MentorProfile = {
  id: string;
  userId: string;
  name?: string;
  email?: string;
  profileImage?: string;
  description: string;
  skills: string[];
  contactEmail?: string;
  approvalStatus: MentorApprovalStatus;
  approvedAt?: string;
};

export type MentorAvailability = {
  id: string;
  mentorId: string;
  startsAt: string;
  endsAt: string;
  status: "available" | "booked" | "unavailable";
};

export type MentorshipBooking = {
  id: string;
  studentId: string;
  mentorId: string;
  availabilityId: string;
  startsAt: string;
  endsAt: string;
  coinCost: number;
  status: "requested" | "confirmed" | "completed" | "cancelled";
};
