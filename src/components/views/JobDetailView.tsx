import React, { useEffect } from 'react';
import DOMPurify from 'dompurify';
import { Post, Category, AdSlotConfig } from '../../types';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Disclaimer } from '../common/Disclaimer';
import { ShareButtons } from '../common/ShareButtons';
import { AdSlot } from '../common/AdSlot';
import { 
  Calendar, 
  Building, 
  Users, 
  GraduationCap, 
  DollarSign, 
  CheckCircle2, 
  Download, 
  ExternalLink, 
  HelpCircle, 
  Clock, 
  FileText, 
  AlertCircle,
  Sparkles,
  ChevronDown,
  BookOpen,
  ClipboardList
} from 'lucide-react';

interface Props {
  post: Post;
  relatedPosts: Post[];
  categories: Category[];
  adSlots: AdSlotConfig[];
  onNavigate: (route: string) => void;
  onSelectPost: (slug: string) => void;
}

export const JobDetailView: React.FC<Props> = ({
  post,
  relatedPosts,
  categories,
  adSlots,
  onNavigate,
  onSelectPost
}) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [post.id]);

  const getAd = (key: string) => adSlots.find(a => a.slotKey === key);

  // Structured Data (JSON-LD) for Google Search SEO
  const jobPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: post.title,
    description: post.excerpt || post.content,
    datePosted: post.createdAt,
    validThrough: post.applicationLastDate || '2026-12-31',
    employmentType: 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: post.organization || 'Government of Madhya Pradesh',
      sameAs: post.officialWebsite || 'https://mp.gov.in'
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressRegion: 'Madhya Pradesh',
        addressCountry: 'IN'
      }
    },
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'INR',
      value: {
        '@type': 'QuantitativeValue',
        value: post.salary || 'Competitive Government Pay Scale'
      }
    }
  };

  const faqSchema = post.faqs && post.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer
      }
    }))
  } : null;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 animate-fade-in space-y-6">
      
      {/* JSON-LD Structured SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: post.categoryName, href: `category/${post.categoryId}` },
          { label: post.titleHindi || post.title }
        ]}
        onNavigate={onNavigate}
      />

      {/* Ad Before Content */}
      <AdSlot slot={getAd('article_before')} />

      {/* Main Post Container */}
      <article className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-7 space-y-6">
        
        {/* Header Title Section */}
        <div className="border-b border-slate-200 pb-5">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-md border border-blue-200">
              {post.categoryName}
            </span>
            <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span>{post.organization}</span>
            </span>
            {post.vacancy && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-md border border-emerald-200">
                कुल पद: {post.vacancy}
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-snug">
            {post.titleHindi || post.title}
          </h1>

          {post.title && post.titleHindi && (
            <h2 className="text-sm sm:text-base text-slate-600 font-medium mt-2">
              {post.title}
            </h2>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              अपडेट तिथि: {new Date(post.updatedAt).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            {post.viewCount && (
              <span>• {post.viewCount.toLocaleString()} उम्मीदवारों ने देखा</span>
            )}
          </div>
        </div>

        {/* Short Introduction */}
        <div className="bg-blue-50/60 border border-blue-150 rounded-xl p-4 text-sm sm:text-base text-slate-800 leading-relaxed">
          {post.excerpt}
        </div>

        {/* Social Share Buttons */}
        <ShareButtons
          title={post.titleHindi || post.title}
          url={`job/${post.slug}`}
        />

        {/* Key Quick Highlight Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">कुल रिक्तियां</span>
            <strong className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 block">{post.vacancy || 'विज्ञप्ति अनुसार'}</strong>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">शैक्षणिक योग्यता</span>
            <strong className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 block truncate" title={post.qualification}>{post.qualification || 'विवरण देखें'}</strong>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">आवेदन अंतिम तिथि</span>
            <strong className="text-xs sm:text-sm font-bold text-red-600 mt-0.5 block">{post.applicationLastDate || 'शीघ्र उपलब्ध'}</strong>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">नौकरी स्थान</span>
            <strong className="text-sm font-bold text-slate-900 mt-0.5 block">मध्य प्रदेश (MP)</strong>
          </div>
        </div>

        {/* Prominent Quick Action CTAs */}
        {(post.applyLink || post.notificationPdf) && (
          <div className="flex flex-wrap items-center gap-3 p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
            {post.applyLink && (
              <a
                href={post.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[160px] py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span>ऑनलाइन आवेदन करें (Apply Now)</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {post.notificationPdf && (
              <a
                href={post.notificationPdf}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[160px] py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Notification (पीडीएफ)</span>
              </a>
            )}
          </div>
        )}

        {/* Table 1: Important Dates (महत्वपूर्ण तिथियां) */}
        <section aria-labelledby="dates-heading" className="space-y-2">
          <h3 id="dates-heading" className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-700" />
            <span>महत्वपूर्ण तिथियां (Important Dates)</span>
          </h3>
          <div className="table-responsive rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">घटनाक्रम (Event)</th>
                  <th className="py-2.5 px-4">तिथि (Dates)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                <tr className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-4 font-medium text-slate-700">आवेदन प्रारंभ होने की तिथि (Apply Online Start)</td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">{post.applicationStartDate || 'विज्ञप्ति अनुसार'}</td>
                </tr>
                <tr className="hover:bg-slate-50/60 bg-red-50/30">
                  <td className="py-2.5 px-4 font-medium text-slate-700">ऑनलाइन आवेदन की अंतिम तिथि (Last Date)</td>
                  <td className="py-2.5 px-4 font-bold text-red-600">{post.applicationLastDate || 'विज्ञप्ति अनुसार'}</td>
                </tr>
                {post.examDate && (
                  <tr className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-4 font-medium text-slate-700">परीक्षा तिथि (Exam Date)</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{post.examDate}</td>
                  </tr>
                )}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-4 font-medium text-slate-700">प्रवेश पत्र (Admit Card Release Date)</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-700">परीक्षा से 7 से 10 दिन पूर्व</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Table 2: Application Fee (आवेदन शुल्क) */}
        {post.applicationFee && (
          <section aria-labelledby="fee-heading" className="space-y-2">
            <h3 id="fee-heading" className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>आवेदन शुल्क (Application Fee)</span>
            </h3>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {post.applicationFee}
              <div className="mt-2 text-xs text-slate-500 pt-2 border-t border-slate-200">
                * शुल्क भुगतान नेट बैंकिंग, डेबिट/क्रेडिट कार्ड, यूपीआई अथवा एमपीऑनलाइन अधिकृत कियोस्क के माध्यम से कर सकते हैं।
              </div>
            </div>
          </section>
        )}

        {/* Middle Article Ad Slot */}
        <AdSlot slot={getAd('article_middle')} />

        {/* Table 3: Vacancy & Eligibility (पद विवरण एवं पात्रता) */}
        <section aria-labelledby="eligibility-heading" className="space-y-2">
          <h3 id="eligibility-heading" className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-700" />
            <span>पद विवरण, शैक्षणिक योग्यता एवं पात्रता (Eligibility Details)</span>
          </h3>
          <div className="table-responsive rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">पद का नाम (Post Name)</th>
                  <th className="py-2.5 px-4">कुल पद</th>
                  <th className="py-2.5 px-4">न्यूनतम शैक्षणिक योग्यता</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">{post.titleHindi || post.title}</td>
                  <td className="py-3 px-4 font-bold text-blue-700">{post.vacancy || '-'}</td>
                  <td className="py-3 px-4 text-slate-700">{post.qualification || 'विस्तृत नियमपुस्तिका देखें'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Age Limit & Salary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {post.ageLimit && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-700" />
                <span>आयु सीमा (Age Limit)</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {post.ageLimit}
              </p>
            </div>
          )}

          {post.salary && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>वेतनमान (Salary / Pay Scale)</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {post.salary}
              </p>
            </div>
          )}
        </div>

        {/* Selection Process & Exam Pattern */}
        {post.selectionProcess && (
          <section aria-labelledby="selection-heading" className="space-y-2">
            <h3 id="selection-heading" className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>चयन प्रक्रिया (Selection Process)</span>
            </h3>
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {post.selectionProcess}
            </div>
          </section>
        )}

        {post.examPattern && (
          <section aria-labelledby="pattern-heading" className="space-y-2">
            <h3 id="pattern-heading" className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-700" />
              <span>परीक्षा पैटर्न एवं अंक योजना (Exam Pattern)</span>
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {post.examPattern}
            </div>
          </section>
        )}

        {/* Detailed Content / Rules */}
        {post.content && (
          <section aria-labelledby="details-heading" className="space-y-2">
            <h3 id="details-heading" className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-700" />
              <span>विस्तृत जानकारी (Full Overview)</span>
            </h3>
            {post.content.includes('<') ? (
              <div 
                className="text-xs sm:text-sm text-slate-800 leading-relaxed overflow-x-auto [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-slate-300 [&_th]:bg-slate-100 [&_th]:p-2.5 [&_th]:border [&_th]:border-slate-300 [&_td]:p-2.5 [&_td]:border [&_td]:border-slate-300 [&_h2]:text-base [&_h2]:font-bold [&_h2]:my-2 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1.5 [&_a]:text-blue-700 [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
              />
            ) : (
              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                {post.content}
              </div>
            )}
          </section>
        )}

        {/* How to Apply Step-by-Step in Hindi */}
        {post.howToApply && (
          <section aria-labelledby="apply-instructions-heading" className="space-y-2">
            <h3 id="apply-instructions-heading" className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-indigo-700" />
              <span>ऑनलाइन आवेदन कैसे करें? (How to Apply Online)</span>
            </h3>
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-150 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {post.howToApply}
            </div>
          </section>
        )}

        {/* Prominent Action Buttons & Important Links Table */}
        <section aria-labelledby="important-links-heading" className="pt-2">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 rounded-t-xl">
            <h3 id="important-links-heading" className="text-base sm:text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>महत्वपूर्ण आधिकारिक लिंक (Important Links)</span>
            </h3>
            <p className="text-xs text-blue-200">
              फॉर्म भरने, नोटिफिकेशन डाउनलोड करने एवं आधिकारिक पोर्टल के सीधे लिंक
            </p>
          </div>

          <div className="table-responsive rounded-b-xl border border-t-0 border-slate-200 overflow-hidden bg-white shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <tbody className="divide-y divide-slate-150">
                {post.applyLink && (
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ऑनलाइन आवेदन करें (Apply Online)
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={post.applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-xs transition-colors"
                      >
                        <span>यहाँ क्लिक करें (Apply)</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                )}

                {post.notificationPdf && (
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      आधिकारिक नोटिफिकेशन डाउनलोड करें (Download Notification PDF)
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={post.notificationPdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-xs transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>डाउनलोड (PDF)</span>
                      </a>
                    </td>
                  </tr>
                )}

                {post.admitCardLink && (
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      प्रवेश पत्र डाउनलोड करें (Download Admit Card)
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={post.admitCardLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-xs transition-colors"
                      >
                        <span>एडमिट कार्ड लिंक</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                )}

                {post.resultLink && (
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      परीक्षा परिणाम देखें (Check Result)
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={post.resultLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-xs transition-colors"
                      >
                        <span>रिजल्ट देखें</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                )}

                {post.officialWebsite && (
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      विभाग की आधिकारिक वेबसाइट (Official Website)
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={post.officialWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-1.5 rounded-lg text-xs border border-slate-300 transition-colors"
                      >
                        <span>आधिकारिक वेबसाइट</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQs Section */}
        {post.faqs && post.faqs.length > 0 && (
          <section aria-labelledby="faq-heading" className="space-y-3 pt-4 border-t border-slate-200">
            <h3 id="faq-heading" className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-700" />
              <span>अक्सर पूछे जाने वाले प्रश्न (Frequently Asked Questions - FAQ)</span>
            </h3>
            <div className="space-y-2.5">
              {post.faqs.map((faq, index) => (
                <div key={index} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 mb-1">
                    Q{index + 1}: {faq.question}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mandatory Official Disclaimer */}
        <Disclaimer />

        {/* Ad After Content */}
        <AdSlot slot={getAd('article_after')} />

      </article>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <section aria-labelledby="related-heading" className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <h3 id="related-heading" className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-700" />
            <span>संबंधित अन्य महत्वपूर्ण भर्तियां (Related Jobs & Exams)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedPosts.slice(0, 4).map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectPost(rel.slug)}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase">{rel.categoryName}</span>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-2 mt-1">
                    {rel.titleHindi || rel.title}
                  </h4>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                  <span>{rel.vacancy || 'विवरण देखें'}</span>
                  <span className="text-blue-700 font-semibold">देखें ›</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
