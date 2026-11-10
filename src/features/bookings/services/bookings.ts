import { platformApi } from "@/lib/api/endpoints";

export const getMentorAvailability = platformApi.mentors.availability;
export const createMentorshipBooking = platformApi.mentors.book;
export const listMyBookings = platformApi.bookings.mine;
export const listMentorBookings = platformApi.mentors.bookings;
export const updateMentorBooking = platformApi.mentors.updateBooking;
