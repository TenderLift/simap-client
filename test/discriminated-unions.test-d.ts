import {expectAssignable, expectNever} from 'tsd';
import type {
	PublicationDetail,
	PublicationAwardDetail,
	PublicationDirectAwardDetail,
	PubDraftDetail,
	PubDraftAwardDetail,
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

// PublicProjectHeaderDates: narrowing on pubType works
declare const dates: PublicProjectHeaderDates;
if (dates.pubType === 'tender') {
	expectAssignable<PublicProjectHeaderDatesAdditional>(dates);
}

if (dates.pubType === 'award') {
	expectAssignable<PublicProjectHeaderDatesDefault>(dates);
}
