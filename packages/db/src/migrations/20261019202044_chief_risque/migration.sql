CREATE TABLE "account_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"account_id" uuid NOT NULL,
	"role" text NOT NULL,
	"admin_sub_role" text,
	"tenant_id" uuid,
	"plan_tier" text,
	"status" text DEFAULT 'active' NOT NULL,
	"pause_reason" text,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"email_normalized" text,
	"email_blind_index" text,
	"email_encrypted" text,
	"phone_e164" text,
	"phone_blind_index" text,
	"phone_encrypted" text,
	"email_verified_at" timestamp with time zone,
	"phone_verified_at" timestamp with time zone,
	"password_hash" text,
	"password_changed_at" timestamp with time zone,
	"preferred_sign_in_method" text DEFAULT 'otp' NOT NULL,
	"totp_secret_encrypted" text,
	"totp_enabled_at" timestamp with time zone,
	"staff_second_factor_method" text,
	"full_name" text NOT NULL,
	"avatar_url" text,
	"country_code" text DEFAULT 'EG' NOT NULL,
	"preferred_language" text DEFAULT 'ar' NOT NULL,
	"traveler_plan_tier" text DEFAULT 'free' NOT NULL,
	"status" text DEFAULT 'pending_verification' NOT NULL,
	"failed_sign_in_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"suspended_at" timestamp with time zone,
	"suspended_reason" text,
	"deletion_requested_at" timestamp with time zone,
	"deletion_purged_at" timestamp with time zone,
	"known_device_fingerprints" jsonb DEFAULT '[]' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"email_normalized" text NOT NULL,
	"full_name" text NOT NULL,
	"sub_role" text NOT NULL,
	"invite_token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"invited_by_account_id" uuid NOT NULL,
	"accepted_by_account_id" uuid,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"actor_account_id" uuid,
	"actor_role" text NOT NULL,
	"tenant_id" uuid,
	"action" text NOT NULL,
	"target_entity_type" text NOT NULL,
	"target_entity_id" text NOT NULL,
	"reason" text,
	"before_state" jsonb,
	"after_state" jsonb,
	"ip_address" text,
	"request_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"account_id" uuid NOT NULL,
	"active_role" text NOT NULL,
	"admin_sub_role" text,
	"active_tenant_id" uuid,
	"moderator_vehicle_id" uuid,
	"moderator_trip_id" uuid,
	"refresh_token_hash" text NOT NULL,
	"surface" text DEFAULT 'web' NOT NULL,
	"device_fingerprint" text,
	"ip_address" text,
	"user_agent" text,
	"second_factor_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_rotated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"max_session_expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"revoked_reason" text
);
--> statement-breakpoint
CREATE TABLE "employee_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid NOT NULL,
	"account_id" uuid,
	"invited_email" text NOT NULL,
	"invited_phone" text,
	"role_title" text DEFAULT 'Employee' NOT NULL,
	"permissions" jsonb NOT NULL,
	"invite_token_hash" text NOT NULL,
	"invite_expires_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'invited' NOT NULL,
	"first_sign_in_completed_at" timestamp with time zone,
	"invited_by_account_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "idempotency_keys" (
	"key" text PRIMARY KEY,
	"actor_account_id" uuid,
	"procedure_name" text NOT NULL,
	"request_hash" text NOT NULL,
	"response_payload" jsonb NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderator_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"trip_id" uuid NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"staff_code_hash" text NOT NULL,
	"valid_from" timestamp with time zone NOT NULL,
	"valid_until" timestamp with time zone NOT NULL,
	"active_device_fingerprint" text,
	"active_session_id" uuid,
	"status" text DEFAULT 'assigned' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"account_id" uuid PRIMARY KEY,
	"bookings_push" boolean DEFAULT true NOT NULL,
	"bookings_sms" boolean DEFAULT true NOT NULL,
	"bookings_email" boolean DEFAULT true NOT NULL,
	"trip_updates_push" boolean DEFAULT true NOT NULL,
	"trip_updates_sms" boolean DEFAULT true NOT NULL,
	"trip_updates_email" boolean DEFAULT true NOT NULL,
	"promotions_push" boolean DEFAULT false NOT NULL,
	"promotions_sms" boolean DEFAULT false NOT NULL,
	"promotions_email" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"owner_account_id" uuid NOT NULL,
	"legal_entity_name" text NOT NULL,
	"display_name_en" text NOT NULL,
	"display_name_ar" text NOT NULL,
	"commercial_reg_number_encrypted" text NOT NULL,
	"tax_number_encrypted" text NOT NULL,
	"tourism_license_number_encrypted" text NOT NULL,
	"tourism_license_expiry" timestamp with time zone NOT NULL,
	"country_code" text DEFAULT 'EG' NOT NULL,
	"headquarters_address" text NOT NULL,
	"signatory_full_name" text NOT NULL,
	"signatory_national_id_encrypted" text NOT NULL,
	"signatory_role_title" text NOT NULL,
	"payout_method" text DEFAULT 'bank_transfer' NOT NULL,
	"payout_iban_encrypted" text NOT NULL,
	"plan_tier" text DEFAULT 'starter' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"child_safety_opt_in" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otp_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"account_id" uuid,
	"target_identifier" text NOT NULL,
	"channel" text NOT NULL,
	"purpose" text NOT NULL,
	"code_hash" text NOT NULL,
	"wrong_attempts" integer DEFAULT 0 NOT NULL,
	"paused_until" timestamp with time zone,
	"resend_count" integer DEFAULT 0 NOT NULL,
	"last_sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"delivery_status" text DEFAULT 'sent' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "privacy_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"account_id" uuid NOT NULL,
	"request_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reason" text,
	"download_url" text,
	"scheduled_purge_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounting_ledger_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid NOT NULL,
	"trip_id" uuid,
	"booking_id" uuid,
	"entry_type" text NOT NULL,
	"direction" text NOT NULL,
	"gross_amount_minor" integer NOT NULL,
	"commission_amount_minor" integer DEFAULT 0 NOT NULL,
	"net_amount_minor" integer NOT NULL,
	"currency_code" text DEFAULT 'EGP' NOT NULL,
	"status" text DEFAULT 'posted' NOT NULL,
	"invoice_number" text,
	"description" text NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"booking_reference" text NOT NULL,
	"tenant_id" uuid NOT NULL,
	"trip_id" uuid NOT NULL,
	"traveler_account_id" uuid NOT NULL,
	"vehicle_id" uuid,
	"passengers_count" integer NOT NULL,
	"passengers" jsonb DEFAULT '[]' NOT NULL,
	"selected_program_ids" jsonb DEFAULT '[]' NOT NULL,
	"seat_labels" jsonb DEFAULT '[]' NOT NULL,
	"coupon_id" uuid,
	"coupon_code" text,
	"subtotal_minor" integer NOT NULL,
	"programs_total_minor" integer DEFAULT 0 NOT NULL,
	"discount_minor" integer DEFAULT 0 NOT NULL,
	"total_amount_minor" integer NOT NULL,
	"currency_code" text DEFAULT 'EGP' NOT NULL,
	"status" text DEFAULT 'pending_payment' NOT NULL,
	"payment_gateway" text,
	"cancelled_at" timestamp with time zone,
	"cancellation_reason" text,
	"refund_amount_minor" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid,
	"booking_id" uuid,
	"payer_account_id" uuid NOT NULL,
	"purpose" text DEFAULT 'trip_booking' NOT NULL,
	"gateway" text NOT NULL,
	"amount_minor" integer NOT NULL,
	"currency_code" text DEFAULT 'EGP' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"provider_reference" text NOT NULL,
	"fawry_reference_code" text,
	"fawry_expires_at" timestamp with time zone,
	"dispute_reason" text,
	"dispute_status" text,
	"refunded_amount_minor" integer DEFAULT 0 NOT NULL,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"scope" text NOT NULL,
	"account_id" uuid,
	"tenant_id" uuid,
	"plan_id" text NOT NULL,
	"role" text NOT NULL,
	"tier" text NOT NULL,
	"billing_cycle" text DEFAULT 'monthly' NOT NULL,
	"price_minor" integer NOT NULL,
	"currency_code" text DEFAULT 'EGP' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"current_period_start" timestamp with time zone NOT NULL,
	"current_period_end" timestamp with time zone NOT NULL,
	"override_note" text,
	"updated_by_account_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "album_shared_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid NOT NULL,
	"album_id" uuid NOT NULL,
	"token" text NOT NULL,
	"created_by_account_id" uuid NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "check_in_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid NOT NULL,
	"trip_id" uuid NOT NULL,
	"vehicle_id" uuid,
	"booking_id" uuid NOT NULL,
	"passenger_id" text NOT NULL,
	"passenger_name" text NOT NULL,
	"seat_label" text,
	"qr_code_token" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"checked_in_by_account_id" uuid,
	"checked_in_at" timestamp with time zone,
	"method" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "driver_lab_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"driver_account_id" uuid NOT NULL,
	"requested_by_admin_account_id" uuid,
	"status" text DEFAULT 'requested' NOT NULL,
	"test_type" text DEFAULT 'both' NOT NULL,
	"lab_center_name" text,
	"appointment_at" timestamp with time zone,
	"deadline_at" timestamp with time zone NOT NULL,
	"result_document_url" text,
	"uploaded_at" timestamp with time zone,
	"reviewed_by_admin_account_id" uuid,
	"reviewed_at" timestamp with time zone,
	"review_notes" text,
	"valid_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"recipient_account_id" uuid NOT NULL,
	"tenant_id" uuid,
	"category" text DEFAULT 'operations' NOT NULL,
	"channel" text DEFAULT 'in_app' NOT NULL,
	"title_ar" text NOT NULL,
	"title_en" text NOT NULL,
	"body_ar" text NOT NULL,
	"body_en" text NOT NULL,
	"action_url" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parent_child_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"parent_account_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"trip_id" uuid NOT NULL,
	"booking_id" uuid NOT NULL,
	"child_passenger_id" text NOT NULL,
	"child_full_name" text NOT NULL,
	"relationship" text DEFAULT 'guardian' NOT NULL,
	"consent_signed" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_photo_albums" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid NOT NULL,
	"trip_id" uuid NOT NULL,
	"photographer_account_id" uuid NOT NULL,
	"title_ar" text NOT NULL,
	"title_en" text NOT NULL,
	"cover_photo_url" text,
	"photo_urls" jsonb DEFAULT '[]' NOT NULL,
	"photo_count" integer DEFAULT 0 NOT NULL,
	"watermarked" boolean DEFAULT false NOT NULL,
	"audience" text DEFAULT 'public' NOT NULL,
	"audience_account_ids" jsonb DEFAULT '[]' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_tracking_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid NOT NULL,
	"trip_id" uuid NOT NULL,
	"vehicle_id" uuid,
	"recorded_by_account_id" uuid,
	"event_type" text NOT NULL,
	"coordinates" jsonb,
	"severity" text DEFAULT 'info' NOT NULL,
	"child_passenger_id" text,
	"message_ar" text,
	"message_en" text,
	"metadata" jsonb,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid,
	"scope" text DEFAULT 'organization' NOT NULL,
	"category_lookup_code" text NOT NULL,
	"name_ar" text NOT NULL,
	"name_en" text NOT NULL,
	"description_ar" text,
	"description_en" text,
	"seat_count" integer NOT NULL,
	"seat_layout" jsonb NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_by_account_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid NOT NULL,
	"vehicle_type_id" uuid NOT NULL,
	"plate_number" text NOT NULL,
	"plate_number_normalized" text NOT NULL,
	"model" text NOT NULL,
	"manufacturing_year" integer NOT NULL,
	"seat_count" integer NOT NULL,
	"registration_status" text DEFAULT 'valid' NOT NULL,
	"registration_expiry" timestamp with time zone,
	"registration_document_url" text,
	"photo_urls" jsonb DEFAULT '[]' NOT NULL,
	"amenity_codes" jsonb DEFAULT '[]' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_by_account_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lookup_types" (
	"id" bigserial PRIMARY KEY,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"value" varchar(255) NOT NULL,
	"code" varchar(128) NOT NULL,
	"parent_id" bigint,
	"sort_by" integer DEFAULT 0 NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_system" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lookups" (
	"id" bigserial PRIMARY KEY,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"value" varchar(255) NOT NULL,
	"code" varchar(128) NOT NULL,
	"lookup_type_id" bigint NOT NULL,
	"parent_id" bigint,
	"sort_by" integer DEFAULT 0 NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "uploaded_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"uploader_account_id" uuid NOT NULL,
	"tenant_id" uuid,
	"disk" text DEFAULT 'uploads' NOT NULL,
	"storage_key" text NOT NULL,
	"original_filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size_bytes" integer NOT NULL,
	"checksum_sha256" text NOT NULL,
	"public_url" text,
	"purpose" text DEFAULT 'general' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"linked_entity_type" text,
	"linked_entity_id" text,
	"linked_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"application_id" uuid NOT NULL,
	"document_type" text NOT NULL,
	"storage_key" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size_bytes" integer NOT NULL,
	"expires_at" timestamp with time zone,
	"verified_status" text DEFAULT 'pending' NOT NULL,
	"rejection_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"applicant_account_id" uuid NOT NULL,
	"application_type" text NOT NULL,
	"state" text DEFAULT 'Pending Review' NOT NULL,
	"payload" jsonb NOT NULL,
	"sla_due_at" timestamp with time zone NOT NULL,
	"assigned_admin_account_id" uuid,
	"reviewed_by_admin_account_id" uuid,
	"reviewed_at" timestamp with time zone,
	"decision_reason_code" text,
	"decision_notes" text,
	"changes_requested_checklist" jsonb,
	"changes_due_at" timestamp with time zone,
	"changes_extension_used" boolean DEFAULT false NOT NULL,
	"rejected_at" timestamp with time zone,
	"reapply_blocked_until" timestamp with time zone,
	"appeal_statement" text,
	"appealed_at" timestamp with time zone,
	"appeal_decided_by_admin_account_id" uuid,
	"appeal_decided_at" timestamp with time zone,
	"provisioned_organization_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consent_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"account_id" uuid NOT NULL,
	"consent_type" text NOT NULL,
	"document_version" text DEFAULT '1.0' NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"signed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "driver_profiles" (
	"account_id" uuid PRIMARY KEY,
	"scope" text DEFAULT 'platform' NOT NULL,
	"owning_tenant_id" uuid,
	"national_id_encrypted" text NOT NULL,
	"license_number_encrypted" text NOT NULL,
	"license_category" text NOT NULL,
	"license_expiry" timestamp with time zone NOT NULL,
	"years_of_experience" integer DEFAULT 1 NOT NULL,
	"service_areas" jsonb DEFAULT '[]' NOT NULL,
	"has_own_vehicle" boolean DEFAULT false NOT NULL,
	"vehicle_make_model" text,
	"vehicle_year" integer,
	"vehicle_plate_number" text,
	"vehicle_seat_capacity" integer,
	"insurance_policy_number" text,
	"insurance_expiry" timestamp with time zone,
	"lab_test_consent_id" uuid,
	"last_lab_result_valid_until" timestamp with time zone,
	"active_lab_pause_reason" text,
	"plan_tier" text DEFAULT 'basic',
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photographer_profiles" (
	"account_id" uuid PRIMARY KEY,
	"scope" text DEFAULT 'platform' NOT NULL,
	"owning_tenant_id" uuid,
	"national_id_encrypted" text NOT NULL,
	"years_of_experience" integer DEFAULT 1 NOT NULL,
	"camera_bodies" jsonb DEFAULT '[]' NOT NULL,
	"lenses" jsonb DEFAULT '[]' NOT NULL,
	"has_drone_license" boolean DEFAULT false NOT NULL,
	"service_regions" jsonb DEFAULT '[]' NOT NULL,
	"specialties" jsonb DEFAULT '[]' NOT NULL,
	"portfolio_photo_count" integer DEFAULT 8 NOT NULL,
	"sample_albums" jsonb DEFAULT '[]' NOT NULL,
	"plan_tier" text DEFAULT 'basic',
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"scope" text DEFAULT 'organization' NOT NULL,
	"tenant_id" uuid,
	"owner_account_id" uuid,
	"code" text NOT NULL,
	"title_ar" text NOT NULL,
	"title_en" text NOT NULL,
	"discount_type" text NOT NULL,
	"discount_value" integer NOT NULL,
	"max_discount_minor" integer,
	"min_order_minor" integer DEFAULT 0 NOT NULL,
	"currency_code" text DEFAULT 'EGP' NOT NULL,
	"max_redemptions" integer,
	"redemptions_count" integer DEFAULT 0 NOT NULL,
	"trip_id" uuid,
	"starts_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_availability_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"supplier_account_id" uuid NOT NULL,
	"supplier_role" text NOT NULL,
	"tenant_id" uuid,
	"block_type" text DEFAULT 'unavailable' NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"trip_id" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_negotiations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid NOT NULL,
	"trip_id" uuid NOT NULL,
	"vehicle_id" uuid,
	"supplier_account_id" uuid NOT NULL,
	"supplier_role" text NOT NULL,
	"status" text DEFAULT 'pending_supplier' NOT NULL,
	"initial_offer_minor" integer NOT NULL,
	"current_offer_minor" integer NOT NULL,
	"agreed_price_minor" integer,
	"currency_code" text DEFAULT 'EGP' NOT NULL,
	"last_offered_by" text DEFAULT 'organization' NOT NULL,
	"rounds_count" integer DEFAULT 1 NOT NULL,
	"notes" text,
	"expires_at" timestamp with time zone NOT NULL,
	"responded_at" timestamp with time zone,
	"created_by_account_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid NOT NULL,
	"trip_id" uuid NOT NULL,
	"title_ar" text NOT NULL,
	"title_en" text NOT NULL,
	"description_ar" text DEFAULT '' NOT NULL,
	"description_en" text DEFAULT '' NOT NULL,
	"day_number" integer DEFAULT 1 NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"location_name_ar" text,
	"location_name_en" text,
	"price_minor" integer DEFAULT 0 NOT NULL,
	"currency_code" text DEFAULT 'EGP' NOT NULL,
	"is_included_in_base" boolean DEFAULT true NOT NULL,
	"capacity" integer,
	"booked_count" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"attachment_urls" jsonb DEFAULT '[]' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_by_account_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_seat_inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid NOT NULL,
	"trip_id" uuid NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"seat_label" text NOT NULL,
	"row_index" integer DEFAULT 0 NOT NULL,
	"col_index" integer DEFAULT 0 NOT NULL,
	"is_accessible" boolean DEFAULT false NOT NULL,
	"is_priority" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'available' NOT NULL,
	"held_by_account_id" uuid,
	"hold_expires_at" timestamp with time zone,
	"booking_id" uuid,
	"passenger_name" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_settings" (
	"id" text PRIMARY KEY DEFAULT 'default',
	"otp_expiry_seconds" integer DEFAULT 300 NOT NULL,
	"otp_resend_cooldown_seconds" integer DEFAULT 45 NOT NULL,
	"otp_max_wrong_attempts" integer DEFAULT 5 NOT NULL,
	"otp_pause_duration_seconds" integer DEFAULT 900 NOT NULL,
	"otp_delivery_max_retries" integer DEFAULT 3 NOT NULL,
	"otp_fallback_channel_enabled" boolean DEFAULT true NOT NULL,
	"max_failed_sign_in_attempts" integer DEFAULT 5 NOT NULL,
	"lockout_duration_seconds" integer DEFAULT 900 NOT NULL,
	"password_min_length" integer DEFAULT 12 NOT NULL,
	"breached_password_check_enabled" boolean DEFAULT true NOT NULL,
	"password_hash_algorithm" text DEFAULT 'argon2id' NOT NULL,
	"access_token_ttl_seconds" integer DEFAULT 900 NOT NULL,
	"web_session_max_seconds" integer DEFAULT 43200 NOT NULL,
	"rotate_refresh_tokens" boolean DEFAULT true NOT NULL,
	"retain_drafts_on_session_expiry" boolean DEFAULT true NOT NULL,
	"deletion_grace_days" integer DEFAULT 30 NOT NULL,
	"admin_invite_ttl_hours" integer DEFAULT 72 NOT NULL,
	"employee_invite_ttl_days" integer DEFAULT 7 NOT NULL,
	"org_supplier_invite_ttl_days" integer DEFAULT 7 NOT NULL,
	"moderator_code_post_trip_hours" integer DEFAULT 24 NOT NULL,
	"new_device_alert_roles" jsonb NOT NULL,
	"role_auth_policies" jsonb NOT NULL,
	"updated_by_account_id" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_settings" (
	"tenant_id" uuid PRIMARY KEY,
	"time_zone" text DEFAULT 'Africa/Cairo' NOT NULL,
	"default_language" text DEFAULT 'ar' NOT NULL,
	"default_currency" text DEFAULT 'EGP' NOT NULL,
	"seat_self_selection_enabled" boolean DEFAULT false NOT NULL,
	"seat_priority_window_minutes" integer DEFAULT 60 NOT NULL,
	"child_tracking_enabled_by_default" boolean DEFAULT false NOT NULL,
	"operations_contact_phone" text,
	"operations_contact_email" text,
	"safety_lead_name" text,
	"safety_hotline_phone" text,
	"billing_contact_name" text,
	"billing_contact_email" text,
	"billing_contact_phone" text,
	"billing_address" text,
	"invoice_language" text DEFAULT 'ar' NOT NULL,
	"tax_number" text,
	"b2b_invoicing_enabled" boolean DEFAULT true NOT NULL,
	"custom_branding_enabled" boolean DEFAULT false NOT NULL,
	"logo_url" text,
	"primary_color_hex" text,
	"secondary_color_hex" text,
	"crm_provider" text,
	"webhook_endpoints" jsonb DEFAULT '[]' NOT NULL,
	"updated_by_account_id" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permission_catalog" (
	"area" text PRIMARY KEY,
	"name_en" text NOT NULL,
	"name_ar" text NOT NULL,
	"description_en" text NOT NULL,
	"description_ar" text NOT NULL,
	"allowed_levels" jsonb NOT NULL,
	"mapped_screens" jsonb NOT NULL,
	"owner_only_by_default" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_catalog" (
	"id" text PRIMARY KEY,
	"role" text NOT NULL,
	"tier" text NOT NULL,
	"name_en" text NOT NULL,
	"name_ar" text NOT NULL,
	"monthly_price_minor" integer DEFAULT 0 NOT NULL,
	"annual_price_minor" integer DEFAULT 0 NOT NULL,
	"currency_code" text DEFAULT 'EGP' NOT NULL,
	"annual_discount_bps" integer DEFAULT 1500 NOT NULL,
	"trial_days" integer DEFAULT 0 NOT NULL,
	"grace_period_days" integer DEFAULT 7 NOT NULL,
	"limits" jsonb NOT NULL,
	"features" jsonb NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_definitions" (
	"role" text PRIMARY KEY,
	"name_en" text NOT NULL,
	"name_ar" text NOT NULL,
	"description_en" text NOT NULL,
	"description_ar" text NOT NULL,
	"self_registration_allowed" boolean DEFAULT false NOT NULL,
	"allowed_surfaces" jsonb NOT NULL,
	"required_verification_channels" text NOT NULL,
	"allowed_primary_methods" jsonb NOT NULL,
	"required_second_factor" text NOT NULL,
	"requires_approval" boolean DEFAULT false NOT NULL,
	"plan_scope" text NOT NULL,
	"default_plan_tier" text,
	"rate_limit_per_minute" integer DEFAULT 60 NOT NULL,
	"sub_roles" jsonb DEFAULT '[]' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" text PRIMARY KEY DEFAULT 'default',
	"markets" jsonb NOT NULL,
	"operational" jsonb NOT NULL,
	"refund_policy_tiers" jsonb NOT NULL,
	"notifications" jsonb NOT NULL,
	"maintenance_and_support" jsonb NOT NULL,
	"feature_flags" jsonb NOT NULL,
	"updated_by_account_id" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid NOT NULL,
	"trip_id" uuid NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"seat_count_snapshot" integer NOT NULL,
	"seat_layout_snapshot" jsonb NOT NULL,
	"driver_source" text DEFAULT 'unassigned' NOT NULL,
	"driver_account_id" uuid,
	"moderator_source" text DEFAULT 'unassigned' NOT NULL,
	"moderator_account_id" uuid,
	"photographer_source" text DEFAULT 'unassigned' NOT NULL,
	"photographer_account_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid NOT NULL,
	"title_ar" text NOT NULL,
	"title_en" text NOT NULL,
	"description_ar" text DEFAULT '' NOT NULL,
	"description_en" text DEFAULT '' NOT NULL,
	"category_lookup_code" text NOT NULL,
	"language" text DEFAULT 'ar' NOT NULL,
	"cover_image_url" text,
	"gallery_image_urls" jsonb DEFAULT '[]' NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"timezone" text DEFAULT 'Africa/Cairo' NOT NULL,
	"origin" jsonb,
	"destinations" jsonb DEFAULT '[]' NOT NULL,
	"seat_assignment_mode" text DEFAULT 'organization_assigned' NOT NULL,
	"seat_priority_window_hours" integer DEFAULT 0 NOT NULL,
	"base_price_minor" integer DEFAULT 0 NOT NULL,
	"currency_code" text DEFAULT 'EGP' NOT NULL,
	"total_capacity" integer DEFAULT 0 NOT NULL,
	"confirmed_seats_count" integer DEFAULT 0 NOT NULL,
	"held_seats_count" integer DEFAULT 0 NOT NULL,
	"child_tracking_enabled" boolean DEFAULT false NOT NULL,
	"state" text DEFAULT 'draft' NOT NULL,
	"publish_mode" text DEFAULT 'draft' NOT NULL,
	"targeted_audience_ids" jsonb DEFAULT '[]' NOT NULL,
	"vip_early_access_until" timestamp with time zone,
	"wizard_steps" jsonb DEFAULT '{"basics":false,"schedule":false,"vehicles":false,"staffing":false,"programs":false,"seating":false,"pricing":false,"publish":false}' NOT NULL,
	"has_staffing_gap" boolean DEFAULT true NOT NULL,
	"published_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"cancellation_reason" text,
	"cancelled_by_account_id" uuid,
	"created_by_account_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "account_roles_account_idx" ON "account_roles" ("account_id");--> statement-breakpoint
CREATE INDEX "account_roles_tenant_idx" ON "account_roles" ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_email_blind_idx" ON "accounts" ("email_blind_index");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_phone_blind_idx" ON "accounts" ("phone_blind_index");--> statement-breakpoint
CREATE INDEX "accounts_status_idx" ON "accounts" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_invites_token_idx" ON "admin_invites" ("invite_token_hash");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" ("actor_account_id");--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_idx" ON "audit_logs" ("tenant_id");--> statement-breakpoint
CREATE INDEX "audit_logs_target_idx" ON "audit_logs" ("target_entity_type","target_entity_id");--> statement-breakpoint
CREATE INDEX "auth_sessions_account_idx" ON "auth_sessions" ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_sessions_refresh_token_idx" ON "auth_sessions" ("refresh_token_hash");--> statement-breakpoint
CREATE INDEX "employee_memberships_tenant_idx" ON "employee_memberships" ("tenant_id");--> statement-breakpoint
CREATE INDEX "employee_memberships_account_idx" ON "employee_memberships" ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "employee_memberships_invite_token_idx" ON "employee_memberships" ("invite_token_hash");--> statement-breakpoint
CREATE INDEX "idempotency_keys_expires_idx" ON "idempotency_keys" ("expires_at");--> statement-breakpoint
CREATE INDEX "moderator_assignments_tenant_idx" ON "moderator_assignments" ("tenant_id");--> statement-breakpoint
CREATE INDEX "moderator_assignments_account_idx" ON "moderator_assignments" ("account_id");--> statement-breakpoint
CREATE INDEX "organizations_owner_idx" ON "organizations" ("owner_account_id");--> statement-breakpoint
CREATE INDEX "organizations_status_idx" ON "organizations" ("status");--> statement-breakpoint
CREATE INDEX "otp_verifications_target_idx" ON "otp_verifications" ("target_identifier","purpose");--> statement-breakpoint
CREATE INDEX "otp_verifications_account_idx" ON "otp_verifications" ("account_id");--> statement-breakpoint
CREATE INDEX "privacy_requests_account_idx" ON "privacy_requests" ("account_id");--> statement-breakpoint
CREATE INDEX "privacy_requests_status_idx" ON "privacy_requests" ("status");--> statement-breakpoint
CREATE INDEX "accounting_ledger_tenant_idx" ON "accounting_ledger_entries" ("tenant_id");--> statement-breakpoint
CREATE INDEX "accounting_ledger_trip_idx" ON "accounting_ledger_entries" ("trip_id");--> statement-breakpoint
CREATE INDEX "accounting_ledger_booking_idx" ON "accounting_ledger_entries" ("booking_id");--> statement-breakpoint
CREATE INDEX "accounting_ledger_status_idx" ON "accounting_ledger_entries" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_reference_uidx" ON "bookings" ("booking_reference");--> statement-breakpoint
CREATE INDEX "bookings_tenant_idx" ON "bookings" ("tenant_id");--> statement-breakpoint
CREATE INDEX "bookings_trip_idx" ON "bookings" ("trip_id");--> statement-breakpoint
CREATE INDEX "bookings_traveler_idx" ON "bookings" ("traveler_account_id");--> statement-breakpoint
CREATE INDEX "bookings_vehicle_idx" ON "bookings" ("vehicle_id");--> statement-breakpoint
CREATE INDEX "bookings_coupon_idx" ON "bookings" ("coupon_id");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_transactions_provider_ref_uidx" ON "payment_transactions" ("provider_reference");--> statement-breakpoint
CREATE INDEX "payment_transactions_tenant_idx" ON "payment_transactions" ("tenant_id");--> statement-breakpoint
CREATE INDEX "payment_transactions_booking_idx" ON "payment_transactions" ("booking_id");--> statement-breakpoint
CREATE INDEX "payment_transactions_payer_idx" ON "payment_transactions" ("payer_account_id");--> statement-breakpoint
CREATE INDEX "payment_transactions_status_idx" ON "payment_transactions" ("status");--> statement-breakpoint
CREATE INDEX "subscription_records_account_idx" ON "subscription_records" ("account_id");--> statement-breakpoint
CREATE INDEX "subscription_records_tenant_idx" ON "subscription_records" ("tenant_id");--> statement-breakpoint
CREATE INDEX "subscription_records_plan_idx" ON "subscription_records" ("plan_id");--> statement-breakpoint
CREATE INDEX "subscription_records_updated_by_idx" ON "subscription_records" ("updated_by_account_id");--> statement-breakpoint
CREATE INDEX "subscription_records_status_idx" ON "subscription_records" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "album_shared_links_token_uidx" ON "album_shared_links" ("token");--> statement-breakpoint
CREATE INDEX "album_shared_links_album_idx" ON "album_shared_links" ("album_id");--> statement-breakpoint
CREATE INDEX "album_shared_links_tenant_idx" ON "album_shared_links" ("tenant_id");--> statement-breakpoint
CREATE INDEX "album_shared_links_status_idx" ON "album_shared_links" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "check_in_records_qr_token_uidx" ON "check_in_records" ("qr_code_token");--> statement-breakpoint
CREATE INDEX "check_in_records_tenant_idx" ON "check_in_records" ("tenant_id");--> statement-breakpoint
CREATE INDEX "check_in_records_trip_idx" ON "check_in_records" ("trip_id");--> statement-breakpoint
CREATE INDEX "check_in_records_vehicle_idx" ON "check_in_records" ("vehicle_id");--> statement-breakpoint
CREATE INDEX "check_in_records_booking_idx" ON "check_in_records" ("booking_id");--> statement-breakpoint
CREATE INDEX "check_in_records_checked_in_by_idx" ON "check_in_records" ("checked_in_by_account_id");--> statement-breakpoint
CREATE INDEX "driver_lab_tests_driver_idx" ON "driver_lab_tests" ("driver_account_id");--> statement-breakpoint
CREATE INDEX "driver_lab_tests_requested_by_idx" ON "driver_lab_tests" ("requested_by_admin_account_id");--> statement-breakpoint
CREATE INDEX "driver_lab_tests_reviewed_by_idx" ON "driver_lab_tests" ("reviewed_by_admin_account_id");--> statement-breakpoint
CREATE INDEX "driver_lab_tests_status_idx" ON "driver_lab_tests" ("status");--> statement-breakpoint
CREATE INDEX "notification_messages_recipient_idx" ON "notification_messages" ("recipient_account_id");--> statement-breakpoint
CREATE INDEX "notification_messages_tenant_idx" ON "notification_messages" ("tenant_id");--> statement-breakpoint
CREATE INDEX "notification_messages_read_idx" ON "notification_messages" ("recipient_account_id","is_read");--> statement-breakpoint
CREATE INDEX "parent_child_links_parent_idx" ON "parent_child_links" ("parent_account_id");--> statement-breakpoint
CREATE INDEX "parent_child_links_tenant_idx" ON "parent_child_links" ("tenant_id");--> statement-breakpoint
CREATE INDEX "parent_child_links_trip_idx" ON "parent_child_links" ("trip_id");--> statement-breakpoint
CREATE INDEX "parent_child_links_booking_idx" ON "parent_child_links" ("booking_id");--> statement-breakpoint
CREATE INDEX "trip_photo_albums_tenant_idx" ON "trip_photo_albums" ("tenant_id");--> statement-breakpoint
CREATE INDEX "trip_photo_albums_trip_idx" ON "trip_photo_albums" ("trip_id");--> statement-breakpoint
CREATE INDEX "trip_photo_albums_photographer_idx" ON "trip_photo_albums" ("photographer_account_id");--> statement-breakpoint
CREATE INDEX "trip_tracking_events_tenant_idx" ON "trip_tracking_events" ("tenant_id");--> statement-breakpoint
CREATE INDEX "trip_tracking_events_trip_idx" ON "trip_tracking_events" ("trip_id");--> statement-breakpoint
CREATE INDEX "trip_tracking_events_vehicle_idx" ON "trip_tracking_events" ("vehicle_id");--> statement-breakpoint
CREATE INDEX "trip_tracking_events_recorded_by_idx" ON "trip_tracking_events" ("recorded_by_account_id");--> statement-breakpoint
CREATE INDEX "trip_tracking_events_occurred_at_idx" ON "trip_tracking_events" ("occurred_at");--> statement-breakpoint
CREATE INDEX "vehicle_types_tenant_idx" ON "vehicle_types" ("tenant_id");--> statement-breakpoint
CREATE INDEX "vehicle_types_created_by_idx" ON "vehicle_types" ("created_by_account_id");--> statement-breakpoint
CREATE INDEX "vehicle_types_scope_status_idx" ON "vehicle_types" ("scope","status");--> statement-breakpoint
CREATE INDEX "vehicles_tenant_idx" ON "vehicles" ("tenant_id");--> statement-breakpoint
CREATE INDEX "vehicles_vehicle_type_idx" ON "vehicles" ("vehicle_type_id");--> statement-breakpoint
CREATE INDEX "vehicles_created_by_idx" ON "vehicles" ("created_by_account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "vehicles_tenant_plate_uidx" ON "vehicles" ("tenant_id","plate_number_normalized");--> statement-breakpoint
CREATE INDEX "vehicles_status_idx" ON "vehicles" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "lookup_types_uuid_uk" ON "lookup_types" ("uuid");--> statement-breakpoint
CREATE UNIQUE INDEX "lookup_types_code_uk" ON "lookup_types" ("code");--> statement-breakpoint
CREATE INDEX "lookup_types_parent_idx" ON "lookup_types" ("parent_id");--> statement-breakpoint
CREATE INDEX "lookup_types_public_deleted_idx" ON "lookup_types" ("is_public","is_deleted","sort_by");--> statement-breakpoint
CREATE INDEX "lookup_types_active_idx" ON "lookup_types" ("is_active","is_deleted","sort_by","code");--> statement-breakpoint
CREATE UNIQUE INDEX "lookups_uuid_uk" ON "lookups" ("uuid");--> statement-breakpoint
CREATE UNIQUE INDEX "lookups_type_code_uk" ON "lookups" ("lookup_type_id","code");--> statement-breakpoint
CREATE INDEX "lookups_code_idx" ON "lookups" ("code");--> statement-breakpoint
CREATE INDEX "lookups_type_idx" ON "lookups" ("lookup_type_id","is_deleted","sort_by");--> statement-breakpoint
CREATE INDEX "lookups_type_active_idx" ON "lookups" ("lookup_type_id","is_active","is_deleted","sort_by","code");--> statement-breakpoint
CREATE INDEX "lookups_parent_idx" ON "lookups" ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uploaded_files_storage_key_uidx" ON "uploaded_files" ("storage_key");--> statement-breakpoint
CREATE INDEX "uploaded_files_uploader_idx" ON "uploaded_files" ("uploader_account_id");--> statement-breakpoint
CREATE INDEX "uploaded_files_tenant_idx" ON "uploaded_files" ("tenant_id");--> statement-breakpoint
CREATE INDEX "uploaded_files_status_expires_idx" ON "uploaded_files" ("status","expires_at");--> statement-breakpoint
CREATE INDEX "uploaded_files_linked_entity_idx" ON "uploaded_files" ("linked_entity_type","linked_entity_id");--> statement-breakpoint
CREATE INDEX "application_documents_app_idx" ON "application_documents" ("application_id");--> statement-breakpoint
CREATE INDEX "applications_applicant_idx" ON "applications" ("applicant_account_id");--> statement-breakpoint
CREATE INDEX "applications_state_idx" ON "applications" ("state");--> statement-breakpoint
CREATE INDEX "applications_sla_due_idx" ON "applications" ("sla_due_at");--> statement-breakpoint
CREATE INDEX "consent_records_account_idx" ON "consent_records" ("account_id");--> statement-breakpoint
CREATE INDEX "driver_profiles_tenant_idx" ON "driver_profiles" ("owning_tenant_id");--> statement-breakpoint
CREATE INDEX "photographer_profiles_tenant_idx" ON "photographer_profiles" ("owning_tenant_id");--> statement-breakpoint
CREATE INDEX "coupons_tenant_idx" ON "coupons" ("tenant_id");--> statement-breakpoint
CREATE INDEX "coupons_owner_idx" ON "coupons" ("owner_account_id");--> statement-breakpoint
CREATE INDEX "coupons_trip_idx" ON "coupons" ("trip_id");--> statement-breakpoint
CREATE UNIQUE INDEX "coupons_code_uidx" ON "coupons" ("code");--> statement-breakpoint
CREATE INDEX "coupons_status_idx" ON "coupons" ("status");--> statement-breakpoint
CREATE INDEX "supplier_availability_supplier_idx" ON "supplier_availability_blocks" ("supplier_account_id");--> statement-breakpoint
CREATE INDEX "supplier_availability_tenant_idx" ON "supplier_availability_blocks" ("tenant_id");--> statement-breakpoint
CREATE INDEX "supplier_availability_trip_idx" ON "supplier_availability_blocks" ("trip_id");--> statement-breakpoint
CREATE INDEX "supplier_availability_window_idx" ON "supplier_availability_blocks" ("starts_at","ends_at");--> statement-breakpoint
CREATE INDEX "supplier_negotiations_tenant_idx" ON "supplier_negotiations" ("tenant_id");--> statement-breakpoint
CREATE INDEX "supplier_negotiations_trip_idx" ON "supplier_negotiations" ("trip_id");--> statement-breakpoint
CREATE INDEX "supplier_negotiations_vehicle_idx" ON "supplier_negotiations" ("vehicle_id");--> statement-breakpoint
CREATE INDEX "supplier_negotiations_supplier_idx" ON "supplier_negotiations" ("supplier_account_id");--> statement-breakpoint
CREATE INDEX "supplier_negotiations_created_by_idx" ON "supplier_negotiations" ("created_by_account_id");--> statement-breakpoint
CREATE INDEX "supplier_negotiations_status_idx" ON "supplier_negotiations" ("status");--> statement-breakpoint
CREATE INDEX "trip_programs_tenant_idx" ON "trip_programs" ("tenant_id");--> statement-breakpoint
CREATE INDEX "trip_programs_trip_idx" ON "trip_programs" ("trip_id");--> statement-breakpoint
CREATE INDEX "trip_programs_created_by_idx" ON "trip_programs" ("created_by_account_id");--> statement-breakpoint
CREATE INDEX "trip_seat_inventory_tenant_idx" ON "trip_seat_inventory" ("tenant_id");--> statement-breakpoint
CREATE INDEX "trip_seat_inventory_trip_idx" ON "trip_seat_inventory" ("trip_id");--> statement-breakpoint
CREATE INDEX "trip_seat_inventory_vehicle_idx" ON "trip_seat_inventory" ("vehicle_id");--> statement-breakpoint
CREATE INDEX "trip_seat_inventory_held_by_idx" ON "trip_seat_inventory" ("held_by_account_id");--> statement-breakpoint
CREATE INDEX "trip_seat_inventory_booking_idx" ON "trip_seat_inventory" ("booking_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trip_seat_inventory_trip_vehicle_seat_uidx" ON "trip_seat_inventory" ("trip_id","vehicle_id","seat_label");--> statement-breakpoint
CREATE INDEX "trip_vehicles_tenant_idx" ON "trip_vehicles" ("tenant_id");--> statement-breakpoint
CREATE INDEX "trip_vehicles_trip_idx" ON "trip_vehicles" ("trip_id");--> statement-breakpoint
CREATE INDEX "trip_vehicles_vehicle_idx" ON "trip_vehicles" ("vehicle_id");--> statement-breakpoint
CREATE INDEX "trip_vehicles_driver_idx" ON "trip_vehicles" ("driver_account_id");--> statement-breakpoint
CREATE INDEX "trip_vehicles_moderator_idx" ON "trip_vehicles" ("moderator_account_id");--> statement-breakpoint
CREATE INDEX "trip_vehicles_photographer_idx" ON "trip_vehicles" ("photographer_account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trip_vehicles_trip_vehicle_uidx" ON "trip_vehicles" ("trip_id","vehicle_id");--> statement-breakpoint
CREATE INDEX "trips_tenant_idx" ON "trips" ("tenant_id");--> statement-breakpoint
CREATE INDEX "trips_state_idx" ON "trips" ("state");--> statement-breakpoint
CREATE INDEX "trips_starts_at_idx" ON "trips" ("starts_at");--> statement-breakpoint
CREATE INDEX "trips_cancelled_by_idx" ON "trips" ("cancelled_by_account_id");--> statement-breakpoint
CREATE INDEX "trips_created_by_idx" ON "trips" ("created_by_account_id");--> statement-breakpoint
ALTER TABLE "account_roles" ADD CONSTRAINT "account_roles_account_id_accounts_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "account_roles" ADD CONSTRAINT "account_roles_tenant_id_organizations_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "admin_invites" ADD CONSTRAINT "admin_invites_invited_by_account_id_accounts_id_fkey" FOREIGN KEY ("invited_by_account_id") REFERENCES "accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "admin_invites" ADD CONSTRAINT "admin_invites_accepted_by_account_id_accounts_id_fkey" FOREIGN KEY ("accepted_by_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_account_id_accounts_id_fkey" FOREIGN KEY ("actor_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_organizations_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_account_id_accounts_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_active_tenant_id_organizations_id_fkey" FOREIGN KEY ("active_tenant_id") REFERENCES "organizations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "employee_memberships" ADD CONSTRAINT "employee_memberships_tenant_id_organizations_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "employee_memberships" ADD CONSTRAINT "employee_memberships_account_id_accounts_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "employee_memberships" ADD CONSTRAINT "employee_memberships_invited_by_account_id_accounts_id_fkey" FOREIGN KEY ("invited_by_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "moderator_assignments" ADD CONSTRAINT "moderator_assignments_tenant_id_organizations_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "moderator_assignments" ADD CONSTRAINT "moderator_assignments_account_id_accounts_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_account_id_accounts_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_account_id_accounts_id_fkey" FOREIGN KEY ("owner_account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "otp_verifications" ADD CONSTRAINT "otp_verifications_account_id_accounts_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "privacy_requests" ADD CONSTRAINT "privacy_requests_account_id_accounts_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "accounting_ledger_entries" ADD CONSTRAINT "accounting_ledger_entries_tenant_id_organizations_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "accounting_ledger_entries" ADD CONSTRAINT "accounting_ledger_entries_trip_id_trips_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "accounting_ledger_entries" ADD CONSTRAINT "accounting_ledger_entries_booking_id_bookings_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tenant_id_organizations_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_trip_id_trips_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_traveler_account_id_accounts_id_fkey" FOREIGN KEY ("traveler_account_id") REFERENCES "accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_vehicle_id_vehicles_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_coupon_id_coupons_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_tenant_id_organizations_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_booking_id_bookings_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_payer_account_id_accounts_id_fkey" FOREIGN KEY ("payer_account_id") REFERENCES "accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "subscription_records" ADD CONSTRAINT "subscription_records_account_id_accounts_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "subscription_records" ADD CONSTRAINT "subscription_records_tenant_id_organizations_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "subscription_records" ADD CONSTRAINT "subscription_records_plan_id_plan_catalog_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plan_catalog"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "subscription_records" ADD CONSTRAINT "subscription_records_updated_by_account_id_accounts_id_fkey" FOREIGN KEY ("updated_by_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "album_shared_links" ADD CONSTRAINT "album_shared_links_tenant_id_organizations_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "album_shared_links" ADD CONSTRAINT "album_shared_links_album_id_trip_photo_albums_id_fkey" FOREIGN KEY ("album_id") REFERENCES "trip_photo_albums"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "album_shared_links" ADD CONSTRAINT "album_shared_links_created_by_account_id_accounts_id_fkey" FOREIGN KEY ("created_by_account_id") REFERENCES "accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "check_in_records" ADD CONSTRAINT "check_in_records_tenant_id_organizations_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "check_in_records" ADD CONSTRAINT "check_in_records_trip_id_trips_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "check_in_records" ADD CONSTRAINT "check_in_records_vehicle_id_vehicles_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "check_in_records" ADD CONSTRAINT "check_in_records_booking_id_bookings_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "check_in_records" ADD CONSTRAINT "check_in_records_checked_in_by_account_id_accounts_id_fkey" FOREIGN KEY ("checked_in_by_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "driver_lab_tests" ADD CONSTRAINT "driver_lab_tests_driver_account_id_accounts_id_fkey" FOREIGN KEY ("driver_account_id") REFERENCES "accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "driver_lab_tests" ADD CONSTRAINT "driver_lab_tests_requested_by_admin_account_id_accounts_id_fkey" FOREIGN KEY ("requested_by_admin_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "driver_lab_tests" ADD CONSTRAINT "driver_lab_tests_reviewed_by_admin_account_id_accounts_id_fkey" FOREIGN KEY ("reviewed_by_admin_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "notification_messages" ADD CONSTRAINT "notification_messages_recipient_account_id_accounts_id_fkey" FOREIGN KEY ("recipient_account_id") REFERENCES "accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notification_messages" ADD CONSTRAINT "notification_messages_tenant_id_organizations_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "parent_child_links" ADD CONSTRAINT "parent_child_links_parent_account_id_accounts_id_fkey" FOREIGN KEY ("parent_account_id") REFERENCES "accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "parent_child_links" ADD CONSTRAINT "parent_child_links_tenant_id_organizations_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "parent_child_links" ADD CONSTRAINT "parent_child_links_trip_id_trips_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "parent_child_links" ADD CONSTRAINT "parent_child_links_booking_id_bookings_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "trip_photo_albums" ADD CONSTRAINT "trip_photo_albums_tenant_id_organizations_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "trip_photo_albums" ADD CONSTRAINT "trip_photo_albums_trip_id_trips_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "trip_photo_albums" ADD CONSTRAINT "trip_photo_albums_photographer_account_id_accounts_id_fkey" FOREIGN KEY ("photographer_account_id") REFERENCES "accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "trip_tracking_events" ADD CONSTRAINT "trip_tracking_events_tenant_id_organizations_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "trip_tracking_events" ADD CONSTRAINT "trip_tracking_events_trip_id_trips_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "trip_tracking_events" ADD CONSTRAINT "trip_tracking_events_vehicle_id_vehicles_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "trip_tracking_events" ADD CONSTRAINT "trip_tracking_events_recorded_by_account_id_accounts_id_fkey" FOREIGN KEY ("recorded_by_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "vehicle_types" ADD CONSTRAINT "vehicle_types_tenant_id_organizations_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "vehicle_types" ADD CONSTRAINT "vehicle_types_created_by_account_id_accounts_id_fkey" FOREIGN KEY ("created_by_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_tenant_id_organizations_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_vehicle_type_id_vehicle_types_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_types"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_created_by_account_id_accounts_id_fkey" FOREIGN KEY ("created_by_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lookup_types" ADD CONSTRAINT "lookup_types_parent_id_lookup_types_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "lookup_types"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lookup_types" ADD CONSTRAINT "lookup_types_created_by_accounts_id_fkey" FOREIGN KEY ("created_by") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lookup_types" ADD CONSTRAINT "lookup_types_updated_by_accounts_id_fkey" FOREIGN KEY ("updated_by") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lookup_types" ADD CONSTRAINT "lookup_types_deleted_by_accounts_id_fkey" FOREIGN KEY ("deleted_by") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lookups" ADD CONSTRAINT "lookups_lookup_type_id_lookup_types_id_fkey" FOREIGN KEY ("lookup_type_id") REFERENCES "lookup_types"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lookups" ADD CONSTRAINT "lookups_parent_id_lookups_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "lookups"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lookups" ADD CONSTRAINT "lookups_created_by_accounts_id_fkey" FOREIGN KEY ("created_by") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lookups" ADD CONSTRAINT "lookups_updated_by_accounts_id_fkey" FOREIGN KEY ("updated_by") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lookups" ADD CONSTRAINT "lookups_deleted_by_accounts_id_fkey" FOREIGN KEY ("deleted_by") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "uploaded_files" ADD CONSTRAINT "uploaded_files_uploader_account_id_accounts_id_fkey" FOREIGN KEY ("uploader_account_id") REFERENCES "accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "uploaded_files" ADD CONSTRAINT "uploaded_files_tenant_id_organizations_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "application_documents" ADD CONSTRAINT "application_documents_application_id_applications_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_applicant_account_id_accounts_id_fkey" FOREIGN KEY ("applicant_account_id") REFERENCES "accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_assigned_admin_account_id_accounts_id_fkey" FOREIGN KEY ("assigned_admin_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_reviewed_by_admin_account_id_accounts_id_fkey" FOREIGN KEY ("reviewed_by_admin_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_wwHHPgexo0iB_fkey" FOREIGN KEY ("appeal_decided_by_admin_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_provisioned_organization_id_organizations_id_fkey" FOREIGN KEY ("provisioned_organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_account_id_accounts_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "driver_profiles" ADD CONSTRAINT "driver_profiles_account_id_accounts_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "driver_profiles" ADD CONSTRAINT "driver_profiles_owning_tenant_id_organizations_id_fkey" FOREIGN KEY ("owning_tenant_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "driver_profiles" ADD CONSTRAINT "driver_profiles_lab_test_consent_id_consent_records_id_fkey" FOREIGN KEY ("lab_test_consent_id") REFERENCES "consent_records"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "photographer_profiles" ADD CONSTRAINT "photographer_profiles_account_id_accounts_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "photographer_profiles" ADD CONSTRAINT "photographer_profiles_owning_tenant_id_organizations_id_fkey" FOREIGN KEY ("owning_tenant_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_tenant_id_organizations_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_owner_account_id_accounts_id_fkey" FOREIGN KEY ("owner_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_trip_id_trips_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "supplier_availability_blocks" ADD CONSTRAINT "supplier_availability_blocks_RiKGitOjE0VV_fkey" FOREIGN KEY ("supplier_account_id") REFERENCES "accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "supplier_availability_blocks" ADD CONSTRAINT "supplier_availability_blocks_tenant_id_organizations_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "supplier_availability_blocks" ADD CONSTRAINT "supplier_availability_blocks_trip_id_trips_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "supplier_negotiations" ADD CONSTRAINT "supplier_negotiations_tenant_id_organizations_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "supplier_negotiations" ADD CONSTRAINT "supplier_negotiations_trip_id_trips_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "supplier_negotiations" ADD CONSTRAINT "supplier_negotiations_vehicle_id_vehicles_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "supplier_negotiations" ADD CONSTRAINT "supplier_negotiations_supplier_account_id_accounts_id_fkey" FOREIGN KEY ("supplier_account_id") REFERENCES "accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "supplier_negotiations" ADD CONSTRAINT "supplier_negotiations_created_by_account_id_accounts_id_fkey" FOREIGN KEY ("created_by_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "trip_programs" ADD CONSTRAINT "trip_programs_tenant_id_organizations_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "trip_programs" ADD CONSTRAINT "trip_programs_trip_id_trips_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "trip_programs" ADD CONSTRAINT "trip_programs_created_by_account_id_accounts_id_fkey" FOREIGN KEY ("created_by_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "trip_seat_inventory" ADD CONSTRAINT "trip_seat_inventory_tenant_id_organizations_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "trip_seat_inventory" ADD CONSTRAINT "trip_seat_inventory_trip_id_trips_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "trip_seat_inventory" ADD CONSTRAINT "trip_seat_inventory_vehicle_id_vehicles_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "trip_seat_inventory" ADD CONSTRAINT "trip_seat_inventory_held_by_account_id_accounts_id_fkey" FOREIGN KEY ("held_by_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "auth_settings" ADD CONSTRAINT "auth_settings_updated_by_account_id_accounts_id_fkey" FOREIGN KEY ("updated_by_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD CONSTRAINT "organization_settings_tenant_id_organizations_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD CONSTRAINT "organization_settings_updated_by_account_id_accounts_id_fkey" FOREIGN KEY ("updated_by_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_account_id_accounts_id_fkey" FOREIGN KEY ("updated_by_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "trip_vehicles" ADD CONSTRAINT "trip_vehicles_tenant_id_organizations_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "trip_vehicles" ADD CONSTRAINT "trip_vehicles_trip_id_trips_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "trip_vehicles" ADD CONSTRAINT "trip_vehicles_vehicle_id_vehicles_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "trip_vehicles" ADD CONSTRAINT "trip_vehicles_driver_account_id_accounts_id_fkey" FOREIGN KEY ("driver_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "trip_vehicles" ADD CONSTRAINT "trip_vehicles_moderator_account_id_accounts_id_fkey" FOREIGN KEY ("moderator_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "trip_vehicles" ADD CONSTRAINT "trip_vehicles_photographer_account_id_accounts_id_fkey" FOREIGN KEY ("photographer_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_tenant_id_organizations_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_cancelled_by_account_id_accounts_id_fkey" FOREIGN KEY ("cancelled_by_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_created_by_account_id_accounts_id_fkey" FOREIGN KEY ("created_by_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;