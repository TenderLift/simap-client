import {expectAssignable, expectNever, expectNotType} from 'tsd';
import type {
	PublicationDetail,
	PublicationAwardDetail,
	PublicationDirectAwardDetail,
	PublicationAdvanceNoticeDetailDiscriminator,
	PubDraftDetail,
	PubDraftAwardDetail,
	PubDraftAdvanceNoticeDetailDiscriminator,
	PublicProjectHeaderDates,
	PublicProjectHeaderDatesAdditional,
	PublicProjectHeaderDatesDefault,
} from '../src/index';

// PublicationDetail: narrowing on type === 'award' must not produce never
declare const pub: PublicationDetail;
if (pub.type === 'award') {
	expectAssignable<PublicationAwardDetail>(pub);
}

if (pub.type === 'direct_award') {
	expectAssignable<PublicationDirectAwardDetail>(pub);
}

// PubDraftDetail: same narrowing works for draft variants
declare const draft: PubDraftDetail;
if (draft.type === 'award') {
	expectAssignable<PubDraftAwardDetail>(draft);
}

// PublicationDetail: narrowing on type === 'advance_notice' must not produce never
if (pub.type === 'advance_notice') {
	expectAssignable<PublicationAdvanceNoticeDetailDiscriminator>(pub);
	expectNotType<never>(pub);
}

// PubDraftDetail: advance_notice narrowing works for draft variants
if (draft.type === 'advance_notice') {
	expectAssignable<PubDraftAdvanceNoticeDetailDiscriminator>(draft);
	expectNotType<never>(draft);
}

// PublicProjectHeaderDates: narrowing on pubType works
declare const dates: PublicProjectHeaderDates;
if (dates.pubType === 'tender') {
	expectAssignable<PublicProjectHeaderDatesAdditional>(dates);
}

if (dates.pubType === 'award') {
	expectAssignable<PublicProjectHeaderDatesDefault>(dates);
}
