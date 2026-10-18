-- ==============================================================================
-- BrightPath CRM — Fictional Coaching Institute Seed Data
-- Target Database: PostgreSQL 15+ / Supabase
-- Notes: Idempotent script; checks for existing records before inserting.
-- ==============================================================================

DO $$
DECLARE
    v_actor_id UUID;
    v_lead_id_1 UUID;
    v_lead_id_2 UUID;
    v_lead_id_3 UUID;
    v_lead_id_4 UUID;
    v_lead_id_5 UUID;
    v_lead_id_6 UUID;
    v_lead_id_7 UUID;
    v_lead_id_8 UUID;
    v_lead_id_9 UUID;
    v_lead_id_10 UUID;
    v_lead_id_11 UUID;
    v_lead_id_12 UUID;
BEGIN
    -- Dynamically attach to the first profile if available, else NULL
    SELECT id INTO v_actor_id FROM public.profiles LIMIT 1;

    -- ==========================================================================
    -- 1. SEED LEADS
    -- ==========================================================================

    -- 1.1 New Leads (Uncontacted)
    IF NOT EXISTS (SELECT 1 FROM public.leads WHERE phone = '+91 98765 43210') THEN
        INSERT INTO public.leads (full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes)
        VALUES ('Aarav Sharma', 'aarav.sharma@example.com', '+91 98765 43210', 'NEET Comprehensive (2-Year)', 'Website', 'New', v_actor_id, v_actor_id, 'Inquired via main website form for 11th grade NEET coaching.')
        RETURNING id INTO v_lead_id_1;

        INSERT INTO public.activities (lead_id, actor_id, activity_type, description)
        VALUES (v_lead_id_1, v_actor_id, 'lead_created', 'Lead submitted via Website form');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.leads WHERE phone = '+91 98111 22334') THEN
        INSERT INTO public.leads (full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes)
        VALUES ('Priya Patel', 'priya.patel@example.com', '+91 98111 22334', 'JEE Advanced Intensive', 'WhatsApp', 'New', v_actor_id, v_actor_id, 'Messaged on WhatsApp inquiring about batch timings and scholarship exam.')
        RETURNING id INTO v_lead_id_2;

        INSERT INTO public.activities (lead_id, actor_id, activity_type, description)
        VALUES (v_lead_id_2, v_actor_id, 'lead_created', 'Lead received via WhatsApp Enquiry channel');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.leads WHERE phone = '+91 99222 33445') THEN
        INSERT INTO public.leads (full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes)
        VALUES ('Rohan Verma', 'rohan.v@example.com', '+91 99222 33445', 'Grade 10 Foundation Math & Science', 'Phone Call', 'New', v_actor_id, v_actor_id, 'Father called regarding evening batch availability for 10th CBSE.')
        RETURNING id INTO v_lead_id_3;

        INSERT INTO public.activities (lead_id, actor_id, activity_type, description)
        VALUES (v_lead_id_3, v_actor_id, 'lead_created', 'Inquiry logged from Phone Call');
    END IF;

    -- 1.2 Contacted Leads (First interaction completed, follow-up scheduled)
    IF NOT EXISTS (SELECT 1 FROM public.leads WHERE phone = '+91 97333 44556') THEN
        INSERT INTO public.leads (full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes)
        VALUES ('Ananya Iyer', 'ananya.iyer@example.com', '+91 97333 44556', 'NEET Repeater Batch', 'Referral', 'Contacted', v_actor_id, v_actor_id, 'Spoke with student. Previous score 520. Interested in physics problem-solving focus.')
        RETURNING id INTO v_lead_id_4;

        INSERT INTO public.activities (lead_id, actor_id, activity_type, description)
        VALUES 
            (v_lead_id_4, v_actor_id, 'lead_created', 'Lead created via Student Referral'),
            (v_lead_id_4, v_actor_id, 'status_changed', 'Status changed from New to Contacted');

        -- Scheduled Overdue Follow-up
        INSERT INTO public.follow_ups (lead_id, assigned_to, due_at, note, status, created_by)
        VALUES (v_lead_id_4, v_actor_id, timezone('utc'::text, now() - INTERVAL '1 day'), 'Call back to confirm demo class attendance on Wednesday', 'pending', v_actor_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.leads WHERE phone = '+91 96444 55667') THEN
        INSERT INTO public.leads (full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes)
        VALUES ('Vikram Malhotra', 'vikram.m@example.com', '+91 96444 55667', 'JEE Mains FastTrack', 'Walk-in', 'Contacted', v_actor_id, v_actor_id, 'Visited center with parents. Handed prospectus and fee schedule.')
        RETURNING id INTO v_lead_id_5;

        INSERT INTO public.activities (lead_id, actor_id, activity_type, description)
        VALUES 
            (v_lead_id_5, v_actor_id, 'lead_created', 'Walk-in visitor registered at reception'),
            (v_lead_id_5, v_actor_id, 'status_changed', 'Status marked Contacted after in-person briefing');

        -- Scheduled Upcoming Follow-up
        INSERT INTO public.follow_ups (lead_id, assigned_to, due_at, note, status, created_by)
        VALUES (v_lead_id_5, v_actor_id, timezone('utc'::text, now() + INTERVAL '2 days'), 'Follow up on fee payment decision and batch slot selection', 'pending', v_actor_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.leads WHERE phone = '+91 95555 66778') THEN
        INSERT INTO public.leads (full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes)
        VALUES ('Meera Nair', 'meera.nair@example.com', '+91 95555 66778', 'CUET General Test + English', 'Website', 'Contacted', v_actor_id, v_actor_id, 'Shared brochure via email. Awaiting reply on subject domain preferences.')
        RETURNING id INTO v_lead_id_6;

        INSERT INTO public.activities (lead_id, actor_id, activity_type, description)
        VALUES 
            (v_lead_id_6, v_actor_id, 'lead_created', 'Website inquiry logged'),
            (v_lead_id_6, v_actor_id, 'status_changed', 'Status updated to Contacted after sending brochure');

        -- Scheduled Upcoming Follow-up
        INSERT INTO public.follow_ups (lead_id, assigned_to, due_at, note, status, created_by)
        VALUES (v_lead_id_6, v_actor_id, timezone('utc'::text, now() + INTERVAL '1 day'), 'Check if brochure was received and answer domain subject doubts', 'pending', v_actor_id);
    END IF;

    -- 1.3 Qualified Leads (High conversion potential, counseling done)
    IF NOT EXISTS (SELECT 1 FROM public.leads WHERE phone = '+91 94666 77889') THEN
        INSERT INTO public.leads (full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes)
        VALUES ('Kabir Das', 'kabir.das@example.com', '+91 94666 77889', 'JEE Advanced Intensive', 'Referral', 'Qualified', v_actor_id, v_actor_id, 'Attended 2-day demo class. Scored 82% in scholarship entrance test.')
        RETURNING id INTO v_lead_id_7;

        INSERT INTO public.activities (lead_id, actor_id, activity_type, description)
        VALUES 
            (v_lead_id_7, v_actor_id, 'lead_created', 'Referral lead created'),
            (v_lead_id_7, v_actor_id, 'status_changed', 'Changed status to Qualified (Scholarship test cleared)');

        -- Completed Follow-up
        INSERT INTO public.follow_ups (lead_id, assigned_to, due_at, note, status, completed_at, created_by)
        VALUES (v_lead_id_7, v_actor_id, timezone('utc'::text, now() - INTERVAL '2 days'), 'Conduct demo class feedback session with parents', 'completed', timezone('utc'::text, now() - INTERVAL '2 days'), v_actor_id);

        -- Upcoming Follow-up
        INSERT INTO public.follow_ups (lead_id, assigned_to, due_at, note, status, created_by)
        VALUES (v_lead_id_7, v_actor_id, timezone('utc'::text, now() + INTERVAL '3 days'), 'Final admission document verification and seat booking', 'pending', v_actor_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.leads WHERE phone = '+91 93777 88990') THEN
        INSERT INTO public.leads (full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes)
        VALUES ('Sara Khan', 'sara.k@example.com', '+91 93777 88990', 'NEET Comprehensive (2-Year)', 'Phone Call', 'Qualified', v_actor_id, v_actor_id, 'Parent requested instalment facility. Discount approved by Center Head.')
        RETURNING id INTO v_lead_id_8;

        INSERT INTO public.activities (lead_id, actor_id, activity_type, description)
        VALUES 
            (v_lead_id_8, v_actor_id, 'lead_created', 'Phone inquiry registered'),
            (v_lead_id_8, v_actor_id, 'status_changed', 'Qualified: Special fee structure approved by management');

        -- Scheduled Overdue Follow-up
        INSERT INTO public.follow_ups (lead_id, assigned_to, due_at, note, status, created_by)
        VALUES (v_lead_id_8, v_actor_id, timezone('utc'::text, now() - INTERVAL '6 hours'), 'Collect first installment cheque for registration', 'pending', v_actor_id);
    END IF;

    -- 1.4 Converted Leads (Enrolled & Fee Deposited)
    IF NOT EXISTS (SELECT 1 FROM public.leads WHERE phone = '+91 92888 99001') THEN
        INSERT INTO public.leads (full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes)
        VALUES ('Devendra Joshi', 'dev.joshi@example.com', '+91 92888 99001', 'NEET Comprehensive (2-Year)', 'Website', 'Converted', v_actor_id, v_actor_id, 'Enrolled! Student ID: BP-2026-NEET-042. Batch: Morning Star Alpha.')
        RETURNING id INTO v_lead_id_9;

        INSERT INTO public.activities (lead_id, actor_id, activity_type, description)
        VALUES 
            (v_lead_id_9, v_actor_id, 'lead_created', 'Website lead created'),
            (v_lead_id_9, v_actor_id, 'status_changed', 'Status updated to Qualified'),
            (v_lead_id_9, v_actor_id, 'status_changed', 'Status updated to Converted — Student enrolled successfully');

        INSERT INTO public.follow_ups (lead_id, assigned_to, due_at, note, status, completed_at, created_by)
        VALUES (v_lead_id_9, v_actor_id, timezone('utc'::text, now() - INTERVAL '3 days'), 'Hand over study material kit and uniform', 'completed', timezone('utc'::text, now() - INTERVAL '3 days'), v_actor_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.leads WHERE phone = '+91 91999 00112') THEN
        INSERT INTO public.leads (full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes)
        VALUES ('Sneha Kulkarni', 'sneha.k@example.com', '+91 91999 00112', 'Grade 10 Foundation Math & Science', 'Walk-in', 'Converted', v_actor_id, v_actor_id, 'Enrolled! Student ID: BP-2026-FD-019. Orientation on Monday.')
        RETURNING id INTO v_lead_id_10;

        INSERT INTO public.activities (lead_id, actor_id, activity_type, description)
        VALUES 
            (v_lead_id_10, v_actor_id, 'lead_created', 'Walk-in inquiry recorded'),
            (v_lead_id_10, v_actor_id, 'status_changed', 'Converted — Admission finalized');

        INSERT INTO public.follow_ups (lead_id, assigned_to, due_at, note, status, completed_at, created_by)
        VALUES (v_lead_id_10, v_actor_id, timezone('utc'::text, now() - INTERVAL '1 day'), 'Send welcome email with orientation schedule', 'completed', timezone('utc'::text, now() - INTERVAL '1 day'), v_actor_id);
    END IF;

    -- 1.5 Lost Leads (With required loss reason)
    IF NOT EXISTS (SELECT 1 FROM public.leads WHERE phone = '+91 90000 11223') THEN
        INSERT INTO public.leads (full_name, email, phone, course_interest, source, status, loss_reason, assigned_to, created_by, notes)
        VALUES ('Aditya Deshmukh', 'aditya.d@example.com', '+91 90000 11223', 'JEE Mains FastTrack', 'WhatsApp', 'Lost', 'Fee structure out of budget; opted for local government coaching college.', v_actor_id, v_actor_id, 'Budget was max 40k. Our fast-track course is 75k.')
        RETURNING id INTO v_lead_id_11;

        INSERT INTO public.activities (lead_id, actor_id, activity_type, description)
        VALUES 
            (v_lead_id_11, v_actor_id, 'lead_created', 'WhatsApp inquiry received'),
            (v_lead_id_11, v_actor_id, 'status_changed', 'Status marked Lost: Fee structure out of budget');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.leads WHERE phone = '+91 98888 22334') THEN
        INSERT INTO public.leads (full_name, email, phone, course_interest, source, status, loss_reason, assigned_to, created_by, notes)
        VALUES ('Tanvi Choudhary', 'tanvi.c@example.com', '+91 98888 22334', 'CUET General Test + English', 'Other', 'Lost', 'Relocating to another city before session commencement.', v_actor_id, v_actor_id, 'Family moving to Bangalore next month.')
        RETURNING id INTO v_lead_id_12;

        INSERT INTO public.activities (lead_id, actor_id, activity_type, description)
        VALUES 
            (v_lead_id_12, v_actor_id, 'lead_created', 'Inquiry logged from Education Fair booth'),
            (v_lead_id_12, v_actor_id, 'status_changed', 'Status marked Lost: Relocating to another city');
    END IF;

    RAISE NOTICE 'BrightPath CRM Demo Seed Data executed successfully!';
END $$;
