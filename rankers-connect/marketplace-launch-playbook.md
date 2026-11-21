# Rankers Connect — Marketplace strategy & launch playbook

## Positioning
A learning-discovery marketplace connecting students/parents with independent tutors and coaching institutes. This is not merely a Rankers Nest Physics landing page.

## Competitor patterns
- UrbanPro: student requirements, phone verification, tutor profiles, matching, tutor coin/lead model, demo booking and partnership incentives. Official help: https://help.urbanpro.com/hc/en-us/articles/360052026714-How-UrbanPro-works-for-Tutors-Training-Institutes and https://help.urbanpro.com/hc/en-us/articles/360058128833-What-is-UrbanPro-Tutor-Partnership-Program
- TeacherOn: students post requirements; teachers create profiles and apply. Some leads use coins; direct student-initiated contact is free for tutors. https://www.teacheron.com/how-it-works-students and https://statuscheckindia.teacheron.com/guide/how-it-works-teachers
- Superprof: free tutor profile/ad creation and tutor-controlled schedule/fees. https://www.superprof.co.in/tutor/

## Differentiation
1. Start narrow: JEE, NEET and Classes 9–12.
2. Curated educator onboarding: contact check, qualification/experience evidence, sample teaching video, subjects, mode, fee range and availability.
3. No expensive tutor coins during initial supply-building.
4. Verify student intent before sharing a lead: phone OTP, exam/class, subject, start timeline, mode, location if offline, budget band and consent.
5. Manual match and demo coordination initially. Do not claim automated matching until built.
6. Clear lead distribution and no guaranteed admission/lead-volume promises.
7. Publish reviews only after verified learning engagement, with consent and moderation.

## Launch gates — do not run paid ads until complete
- Connect forms to a secure backend (Firebase or equivalent); current forms are browser-local only.
- Admin dashboard with lead stages: New, Contacted, Qualified, Matched, Demo Scheduled, Demo Attended, Converted, Lost.
- Privacy Policy, Terms, contact details, consent and data-retention/deletion process.
- Secure admin access; never expose private keys in frontend.
- Notification delivery (email/WhatsApp via approved provider) and end-to-end testing.
- Publish real educator profiles only with permission and evidence.
- Configure domain, HTTPS, Google Search Console, sitemap and analytics.
- Test mobile forms, spam protection and phone validation.

## First 30 days
### Supply: onboard 30–50 quality educators
Personally invite independent JEE/NEET teachers and small institutes. Partner with Maths/Chemistry teachers who need a Physics specialist. Offer founding profiles free for a limited pilot; do not promise leads.

### Demand: acquire first 100 genuine student requirements
Reactivate old enquiries with consent, segment JEE/NEET/school. Run free Physics diagnostic tests and parent/student webinars. Partner with local tuition centres and subject teachers. Use student/parent referrals. Publish useful short videos and search pages for high-intent terms.

### Paid acquisition — only after conversion tracking works
- Campaign A: students/parents — JEE Physics tutor and NEET Physics tutor.
- Campaign B: educators — founding tutor profile invitation.
- Campaign C: local tuition-centre partnerships.
Keep student and tutor campaigns separate.
Start with a small, controlled test. NCR offline/hybrid demand and India-wide online demand must be separate campaigns. Measure qualified enquiries, demos attended, matches and paid starts, not clicks alone.

## Funnel metrics
Student: click → valid enquiry → qualified → contacted → matched → demo booked → demo attended → admission.
Tutor: invitation → application → verified profile → approved → available → first match → response time.
Measure cost per qualified enquiry, contact rate, demo attendance, match rate, admission rate, tutor response time and referral rate.

## Business model
Pilot free for both sides. Later test educator subscription, qualified lead unlock, institute listing subscription or transparent success fee. Publish terms before charging.

## Current limitation
The static website forms save submissions only in each visitor's browser. They do not transmit leads to Rankers Connect. Do not advertise it for live lead collection until backend, admin notifications, privacy/consent and end-to-end tests are complete.
