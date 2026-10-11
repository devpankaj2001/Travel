'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, Building2, Check, Compass, FileText, Loader2, Upload, User
} from 'lucide-react';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../Toast';
import {
  BUSINESS_TYPES,
  CATEGORY_IMAGES,
  CATEGORY_THEMES,
  COUNTRIES,
  COUNTRY_CODES,
  DEFAULT_ADD_ONS,
  DEFAULT_TAXONOMY,
  IDENTITY_TYPES,
  SERVICES_BY_SLUG,
  buildRegistrationPayload,
  documentChecklist,
  emptyRegistrationForm,
  hasDuplicateName,
  validateRegistrationStep
} from './registrationData';

const STEPS = [
  { key: 'account', label: 'Account', title: 'Create Supplier Account' },
  { key: 'type', label: 'Account Type', title: 'Select Supplier Account Type' },
  { key: 'contact', label: 'Contact', title: 'Account & Contact Details' },
  { key: 'details', label: 'Details', title: 'Additional Information' },
  { key: 'categories', label: 'Categories', title: 'Category Selection' },
  { key: 'subcategories', label: 'Sub-Categories', title: 'Sub-Category Selection' },
  { key: 'services', label: 'Services', title: 'Services / Activities Provided' },
  { key: 'description', label: 'Description', title: 'Description of Services' },
  { key: 'documents', label: 'Documents', title: 'Upload Verification Documents' },
  { key: 'review', label: 'Review', title: 'Review and Submit Application' }
];

function OtherSpecify({ checked, onToggle, value, onChange, onAdd, error }) {
  return (
    <div style={{ gridColumn: '1 / -1' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <label style={{ display: 'inline-flex', gap: 10, alignItems: 'center', fontSize: 14, margin: 0 }}>
          <input type="checkbox" checked={checked} onChange={onToggle} />
          <span>Other (Please specify)</span>
        </label>
        {checked ? (
          <input
            style={{ ...inputStyle(Boolean(error)), maxWidth: 280 }}
            value={value}
            placeholder="Please specify"
            onChange={onChange}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onAdd();
              }
            }}
          />
        ) : null}
      </div>
      {error ? <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{error}</div> : null}
    </div>
  );
}

const inputStyle = (invalid) => ({
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 12px',
  borderRadius: 8,
  border: `1px solid ${invalid ? '#dc2626' : '#d5dde8'}`,
  fontSize: 14,
  color: '#0f172a',
  background: '#fff',
  outline: 'none'
});

function Field({ label, required, error, children }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
        {label} {required ? <span style={{ color: '#dc2626' }}>*</span> : null}
      </span>
      {children}
      {error ? <span style={{ display: 'block', marginTop: 4, color: '#dc2626', fontSize: 12 }}>{error}</span> : null}
    </label>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div role="alert" style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 8, background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', fontSize: 13 }}>
      {message}
    </div>
  );
}

function filePreviewUrl(file) {
  if (!file?.url) return '';
  if (/^https?:/i.test(file.url)) return file.url;
  const origin = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');
  return `${origin}${file.url}`;
}

function InlineProofFile({ file, uploading, onFile, error }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {file ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#15803d', fontSize: 13, fontWeight: 700 }}>
            <Check size={16} /> {file.name}
          </span>
        ) : null}
        <label style={{ border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          {uploading ? <Loader2 size={14} /> : <Upload size={14} />}
          Choose File
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf" style={{ display: 'none' }} onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
      </div>
      {error ? <div style={{ color: '#dc2626', fontSize: 12, marginTop: 6 }}>{error}</div> : null}
    </div>
  );
}

function ProofUpload({ label, required, hint, file, error, uploading, onFile }) {
  const preview = file && /\.(jpe?g|png|webp)$/i.test(file.name || file.url || '') ? filePreviewUrl(file) : '';
  return (
    <div style={{ border: `1px solid ${error ? '#fecaca' : '#e2e8f0'}`, borderRadius: 10, padding: 12, background: '#fff' }}>
      <div style={{ fontWeight: 750, fontSize: 13, marginBottom: 8 }}>
        {label} {required ? <span style={{ color: '#dc2626' }}>*</span> : <span style={{ color: '#94a3b8', fontWeight: 600 }}>{/other/i.test(label) ? 'Optional' : 'If applicable'}</span>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <div style={{ minWidth: 0 }}>
          {preview ? <img src={preview} alt="" style={{ width: 72, height: 52, objectFit: 'cover', borderRadius: 6, marginBottom: 6, display: 'block' }} /> : null}
          <div style={{ fontSize: 12, color: file ? '#15803d' : '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={14} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{file ? file.name : hint}</span>
          </div>
        </div>
        <label style={{ background: '#1d6fe8', color: '#fff', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          {uploading ? <Loader2 size={14} /> : <Upload size={14} />}
          {file ? 'Replace' : 'Choose File'}
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf" style={{ display: 'none' }} onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
      </div>
      {error ? <div style={{ color: '#dc2626', fontSize: 12, marginTop: 6 }}>{error}</div> : null}
    </div>
  );
}

export default function SupplierSignupWizard() {
  const router = useRouter();
  const { updateUserState } = useAuth();
  const { addToast } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyRegistrationForm);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [taxonomy, setTaxonomy] = useState(DEFAULT_TAXONOMY);
  const [addOnOptions, setAddOnOptions] = useState(DEFAULT_ADD_ONS);
  const [showPassword, setShowPassword] = useState(false);
  const [uploadingKey, setUploadingKey] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const [submitted, setSubmitted] = useState(null);
  const [deselectSlug, setDeselectSlug] = useState('');
  const [returnStep, setReturnStep] = useState(null);

  useEffect(() => {
    let active = true;
    authService.getTaxonomy().then((res) => {
      if (!active || !res?.success || !res.data?.categories?.length) return;
      const mapped = res.data.categories.map((category) => ({
        id: category.id,
        slug: category.slug,
        name: category.name,
        subcategories: (category.subcategories || []).map((sub) => ({
          id: sub.id,
          name: sub.name,
          is_other: Boolean(sub.is_other) || String(sub.name).toLowerCase() === 'other'
        })),
        services: (category.services || []).map((service) => service.name).filter(Boolean)
      }));
      mapped.forEach((category) => {
        if (!category.services.length) category.services = SERVICES_BY_SLUG[category.slug] || [];
      });
      setTaxonomy(mapped);
      const addonNames = (res.data.addOns || [])
        .map((item) => item.name)
        .filter((name) => name && name.toLowerCase() !== 'other' && !/other applicable/i.test(name));
      if (addonNames.length) setAddOnOptions(addonNames);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!otpOpen || resendIn <= 0) return undefined;
    const timer = setInterval(() => setResendIn((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [otpOpen, resendIn]);

  const detailsTitle = form.account_type === 'corporate'
    ? 'Corporate Entity – Business Information'
    : 'Individual Person – Additional Information';
  const stepTitle = step === 3 ? detailsTitle : STEPS[step].title;
  const selectedCategories = useMemo(
    () => taxonomy.filter((category) => form.main_categories.includes(category.slug)),
    [taxonomy, form.main_categories]
  );
  const serviceOptions = useMemo(() => {
    const groups = selectedCategories.map((category) => ({
      slug: category.slug,
      name: category.name,
      services: category.services?.length ? category.services : (SERVICES_BY_SLUG[category.slug] || [])
    }));
    return groups.filter((group) => group.services.length);
  }, [selectedCategories]);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setBanner('');
  };

  const goTo = (nextStep) => {
    setStep(nextStep);
    setBanner('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const withPendingNames = (source) => {
    const next = {
      ...source,
      custom_sub_input: { ...source.custom_sub_input },
      sub_selections: { ...source.sub_selections },
      custom_services: [...source.custom_services],
      custom_addons: [...source.custom_addons]
    };
    let changed = false;
    source.main_categories.forEach((slug) => {
      const current = next.sub_selections[slug] || { ids: [], names: [], custom: [], other: false };
      const category = taxonomy.find((item) => item.slug === slug);
      const value = (source.custom_sub_input?.[slug] || '').trim();
      const known = category?.subcategories?.map((item) => item.name) || [];
      if (current.other && value && !hasDuplicateName(current.custom, value) && !hasDuplicateName(known, value)) {
        next.sub_selections[slug] = { ...current, custom: [...(current.custom || []), value] };
        next.custom_sub_input[slug] = '';
        changed = true;
      }
    });
    const serviceValue = (source.custom_service_input || '').trim();
    const knownServices = serviceOptions.flatMap((group) => group.services);
    if (source.other_service_selected && serviceValue && !hasDuplicateName(next.custom_services, serviceValue) && !hasDuplicateName(knownServices, serviceValue)) {
      next.custom_services = [...next.custom_services, serviceValue];
      next.custom_service_input = '';
      changed = true;
    }
    const addonValue = (source.custom_addon_input || '').trim();
    if (source.other_addon_selected && addonValue && !hasDuplicateName(next.custom_addons, addonValue) && !hasDuplicateName(addOnOptions, addonValue)) {
      next.custom_addons = [...next.custom_addons, addonValue];
      next.custom_addon_input = '';
      changed = true;
    }
    return changed ? next : source;
  };

  const continueStep = () => {
    const workingForm = withPendingNames(form);
    if (workingForm !== form) setForm(workingForm);
    const nextErrors = validateRegistrationStep(step, workingForm, taxonomy);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setBanner('Please correct the highlighted fields before continuing.');
      return;
    }
    if (step === 2 && form.account_type === 'individual') {
      setForm((prev) => ({
        ...prev,
        full_legal_name: prev.full_legal_name || `${prev.first_name} ${prev.last_name}`.trim(),
        residential_address: prev.residential_address || prev.contact_address
      }));
    }
    if (returnStep != null) {
      const destination = returnStep;
      setReturnStep(null);
      goTo(destination);
      return;
    }
    goTo(step + 1);
  };

  const leaveStep = () => {
    if (returnStep != null) {
      const destination = returnStep;
      setReturnStep(null);
      goTo(destination);
      return;
    }
    if (step === 0) router.push('/become-a-supplier');
    else goTo(step - 1);
  };

  const toggleCategory = (slug) => {
    const selected = form.main_categories.includes(slug);
    if (!selected) {
      setField('main_categories', [...form.main_categories, slug]);
      return;
    }
    const selection = form.sub_selections[slug];
    const hasChoices = selection && (selection.names?.length || selection.custom?.length || selection.other);
    if (hasChoices) {
      setDeselectSlug(slug);
      return;
    }
    setField('main_categories', form.main_categories.filter((item) => item !== slug));
  };

  const confirmDeselect = () => {
    const slug = deselectSlug;
    setForm((prev) => {
      const subSelections = { ...prev.sub_selections };
      delete subSelections[slug];
      const removedServices = new Set((taxonomy.find((item) => item.slug === slug)?.services) || SERVICES_BY_SLUG[slug] || []);
      return {
        ...prev,
        main_categories: prev.main_categories.filter((item) => item !== slug),
        sub_selections: subSelections,
        services: prev.services.filter((service) => !removedServices.has(service))
      };
    });
    setDeselectSlug('');
  };

  const toggleSubcategory = (category, sub) => {
    setForm((prev) => {
      const current = prev.sub_selections[category.slug] || { ids: [], names: [], custom: [], other: false };
      if (sub.is_other) {
        return {
          ...prev,
          sub_selections: { ...prev.sub_selections, [category.slug]: { ...current, other: !current.other } }
        };
      }
      const exists = current.names.includes(sub.name);
      return {
        ...prev,
        sub_selections: {
          ...prev.sub_selections,
          [category.slug]: {
            ...current,
            names: exists ? current.names.filter((name) => name !== sub.name) : [...current.names, sub.name],
            ids: exists
              ? current.ids.filter((id) => id !== sub.id)
              : (sub.id ? [...current.ids, sub.id] : current.ids)
          }
        }
      };
    });
    setErrors((prev) => ({ ...prev, [`sub_${category.slug}`]: undefined }));
  };

  const addCustomSubcategory = (slug) => {
    const value = (form.custom_sub_input[slug] || '').trim();
    const category = taxonomy.find((item) => item.slug === slug);
    const current = form.sub_selections[slug] || { ids: [], names: [], custom: [], other: false };
    if (!value) {
      setErrors((prev) => ({ ...prev, [`custom_${slug}`]: 'Enter a sub-category name.' }));
      return;
    }
    if (hasDuplicateName(current.custom, value) || hasDuplicateName(category?.subcategories.map((item) => item.name) || [], value)) {
      setErrors((prev) => ({ ...prev, [`custom_${slug}`]: 'This sub-category is already added.' }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      custom_sub_input: { ...prev.custom_sub_input, [slug]: '' },
      sub_selections: {
        ...prev.sub_selections,
        [slug]: { ...current, other: true, custom: [...current.custom, value] }
      }
    }));
    setErrors((prev) => ({ ...prev, [`custom_${slug}`]: undefined, [`sub_${slug}`]: undefined }));
    addToast(`Custom sub-category “${value}” will stay pending review.`, 'info');
  };

  const addCustomService = () => {
    const value = form.custom_service_input.trim();
    if (!value) {
      setErrors((prev) => ({ ...prev, custom_services: 'Enter a custom service name.' }));
      return;
    }
    const known = serviceOptions.flatMap((group) => group.services);
    if (hasDuplicateName(form.custom_services, value) || hasDuplicateName(known, value)) {
      setErrors((prev) => ({ ...prev, custom_services: 'This service is already added.' }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      other_service_selected: true,
      custom_service_input: '',
      custom_services: [...prev.custom_services, value]
    }));
    setErrors((prev) => ({ ...prev, custom_services: undefined, services: undefined }));
  };

  const addCustomAddon = () => {
    const value = form.custom_addon_input.trim();
    if (!value) {
      setErrors((prev) => ({ ...prev, custom_addons: 'Enter an add-on name.' }));
      return;
    }
    if (hasDuplicateName(form.custom_addons, value) || hasDuplicateName(addOnOptions, value)) {
      setErrors((prev) => ({ ...prev, custom_addons: 'This add-on is already added.' }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      other_addon_selected: true,
      custom_addon_input: '',
      custom_addons: [...prev.custom_addons, value]
    }));
    setErrors((prev) => ({ ...prev, custom_addons: undefined }));
  };

  const uploadDocument = async (key, file) => {
    if (!file) return;
    const allowed = ['pdf', 'jpg', 'jpeg', 'png'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!allowed.includes(extension)) {
      setErrors((prev) => ({ ...prev, [`doc_${key}`]: 'Upload a PDF, JPG, or PNG file.' }));
      addToast('Only PDF, JPG, and PNG files are accepted.', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [`doc_${key}`]: 'File must be 10 MB or smaller.' }));
      addToast('File must be 10 MB or smaller.', 'error');
      return;
    }
    setUploadingKey(key);
    const result = await authService.uploadDocument(file);
    setUploadingKey('');
    if (!result?.success || !result.data?.document_url) {
      const message = result?.message || 'The document could not be uploaded. Please try again.';
      setErrors((prev) => ({ ...prev, [`doc_${key}`]: message }));
      addToast(message, 'error');
      return;
    }
    setForm((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [key]: {
          name: result.data.document_name || file.name,
          url: result.data.document_url,
          size: result.data.file_size || file.size
        }
      }
    }));
    setErrors((prev) => ({ ...prev, [`doc_${key}`]: undefined }));
    addToast(`${file.name} uploaded.`, 'success');
  };

  const submitApplication = async () => {
    for (let index = 0; index <= 8; index += 1) {
      const stepErrors = validateRegistrationStep(index, form, taxonomy);
      if (Object.keys(stepErrors).length) {
        setErrors(stepErrors);
        setBanner('Some required registration details are still missing. The rest of your application is still saved.');
        setReturnStep(9);
        goTo(index);
        return;
      }
    }
    setSubmitting(true);
    setBanner('');
    const result = await authService.supplierSignup(buildRegistrationPayload(form, taxonomy));
    setSubmitting(false);
    if (!result?.success) {
      const message = result?.message || 'The application could not be submitted.';
      setBanner(message);
      if (Array.isArray(result?.errors)) {
        const mapped = {};
        result.errors.forEach((item) => { mapped[item.field] = item.message; });
        setErrors(mapped);
      }
      addToast(message, 'error');
      return;
    }
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setResendIn(60);
    setOtpOpen(true);
    addToast('Verification code sent to your email and mobile number. It is valid for 10 minutes.', 'success');
  };

  const verifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setOtpError('Enter the 6-digit verification code.');
      return;
    }
    setSubmitting(true);
    setOtpError('');
    const result = await authService.supplierVerifyOtp({
      email: form.email.trim(),
      phone: `${form.country_code}${form.phone.replace(/\D/g, '').replace(/^0+/, '')}`,
      code
    });
    setSubmitting(false);
    if (!result?.success) {
      setOtpError(result?.message || 'The verification code is incorrect.');
      addToast(result?.message || 'Verification failed.', 'error');
      return;
    }
    if (result.data?.user) updateUserState(result.data.user);
    setOtpOpen(false);
    setSubmitted({
      reference: result.data?.application_reference,
      submittedAt: result.data?.submitted_at,
      emailSent: result.data?.email_sent,
      status: result.data?.status || 'pending'
    });
    addToast('Application submitted. Status: Pending approval.', 'success');
  };

  const resendOtp = async () => {
    if (resendIn > 0) return;
    const result = await authService.supplierResendOtp({
      email: form.email.trim(),
      phone: `${form.country_code}${form.phone.replace(/\D/g, '').replace(/^0+/, '')}`
    });
    if (!result?.success) {
      setOtpError(result?.message || 'The code could not be sent again.');
      return;
    }
    addToast('A new verification code has been sent to your email and mobile number.', 'success');
    setResendIn(60);
  };

  const docs = documentChecklist(form.account_type, form.country);

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7fb', fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif", color: '#0f172a' }}>
      <style>{`
        .sr-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .sr-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .sr-checks { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 28px; align-items: center; }
        .sr-checks label { color: #334155; font-size: 14px; }
        .sr-checks input[type="checkbox"] { width: 16px; height: 16px; accent-color: #1d6fe8; margin-top: 1px; flex-shrink: 0; }
        .sr-group-title { margin: 0 0 14px; font-size: 15px; font-weight: 800; color: #0f172a; }
        .sr-progress { display: flex; gap: 0; overflow-x: auto; background: #fff; border-bottom: 1px solid #e2e8f0; padding: 12px 16px 10px; }
        .sr-step { display: flex; align-items: center; gap: 8px; min-width: max-content; color: #94a3b8; font-size: 12px; font-weight: 700; }
        .sr-line { width: 28px; height: 2px; background: #e2e8f0; }
        .sr-line.on { background: #93c5fd; }
        .sr-num { width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; border: 2px solid #cbd5e1; background: #fff; font-size: 12px; }
        .sr-step.done { color: #15803d; }
        .sr-step.done .sr-num { background: #16a34a; border-color: #16a34a; color: #fff; }
        .sr-step.current { color: #1d4ed8; }
        .sr-step.current .sr-num { background: #1d6fe8; border-color: #1d6fe8; color: #fff; }
        .sr-cat { position: relative; height: 148px; border-radius: 12px; overflow: hidden; border: 2px solid transparent; background: #0f172a center/cover no-repeat; color: #fff; text-align: left; cursor: pointer; padding: 0; }
        .sr-cat.selected { border-color: #1d6fe8; box-shadow: 0 0 0 3px rgba(29,111,232,0.25); }
        .sr-cat-shade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(15,23,42,0.82), rgba(15,23,42,0.15)); }
        .sr-cat-name { position: absolute; left: 12px; right: 12px; bottom: 12px; font-weight: 800; font-size: 15px; }
        .sr-cat-check { position: absolute; top: 10px; right: 10px; width: 24px; height: 24px; border-radius: 50%; background: #1d6fe8; display: flex; align-items: center; justify-content: center; }
        @media (max-width: 760px) {
          .sr-grid-2, .sr-grid-3, .sr-checks { grid-template-columns: 1fr !important; }
          .sr-step-label { display: none; }
        }
      `}</style>

      <header style={{ background: '#1d6fe8', color: '#fff' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <Link href="/" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}>
            <Compass size={22} /> TravelHub
          </Link>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{submitted ? 'Application Submitted' : stepTitle}</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, minWidth: 90, textAlign: 'right' }}>
            {submitted ? 'Pending' : `Step ${step + 1} of ${STEPS.length}`}
          </div>
        </div>
      </header>
      {!submitted && (
        <div className="sr-progress" aria-label="Registration progress">
          {STEPS.map((item, index) => (
            <div key={item.key} className={`sr-step${index < step ? ' done' : ''}${index === step ? ' current' : ''}`}>
              {index > 0 ? <span className={`sr-line${index <= step ? ' on' : ''}`} /> : null}
              <span className="sr-num">{index < step ? <Check size={14} /> : index + 1}</span>
              <span className="sr-step-label">{item.label}</span>
            </div>
          ))}
        </div>
      )}

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '28px 16px 48px' }}>
        {submitted ? (
          <section style={{ background: '#fff', borderRadius: 16, padding: '36px 28px', boxShadow: '0 10px 30px rgba(15,23,42,0.06)', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={32} />
            </div>
            <h1 style={{ fontSize: 28, margin: '0 0 8px' }}>Application Submitted Successfully</h1>
            <p style={{ color: '#475569', marginTop: 0 }}>Your supplier registration is in pending status until an admin reviews it.</p>
            <div style={{ textAlign: 'left', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, margin: '20px auto', maxWidth: 460 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}><span>Application Reference Number</span><strong>{submitted.reference || 'Pending assignment'}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}><span>Submitted On</span><strong>{new Date(submitted.submittedAt || Date.now()).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span>Status</span><strong style={{ color: '#b45309' }}>Pending</strong></div>
            </div>
            <p style={{ color: '#475569', fontSize: 14 }}>
              {submitted.emailSent
                ? 'A confirmation email has been sent. You will receive another email when the application is approved or if more information is required.'
                : 'Your application is saved. The confirmation email could not be sent right now. Keep your reference number and check the supplier dashboard for status updates.'}
            </p>
            <button type="button" onClick={() => router.push('/supplier/dashboard')} style={{ marginTop: 8, background: '#1d6fe8', color: '#fff', border: 0, borderRadius: 8, padding: '12px 22px', fontWeight: 800, cursor: 'pointer' }}>
              Go to Dashboard
            </button>
          </section>
        ) : (
          <section style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', boxShadow: '0 10px 30px rgba(15,23,42,0.06)' }}>
            <ErrorBanner message={banner} />
            {returnStep != null ? (
              <p style={{ margin: '0 0 16px', background: '#eff6ff', color: '#1e40af', borderRadius: 8, padding: '10px 12px', fontSize: 13 }}>
                You are editing this section only. The rest of your application stays saved.
              </p>
            ) : null}

            {step === 0 && (
              <div className="sr-grid-2">
                <Field label="First Name" required error={errors.first_name}>
                  <input style={inputStyle(errors.first_name)} value={form.first_name} onChange={(e) => setField('first_name', e.target.value)} />
                </Field>
                <Field label="Last Name" required error={errors.last_name}>
                  <input style={inputStyle(errors.last_name)} value={form.last_name} onChange={(e) => setField('last_name', e.target.value)} />
                </Field>
                <Field label="Email Address" required error={errors.email}>
                  <input type="email" style={inputStyle(errors.email)} value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="name@company.com" />
                </Field>
                <Field label="Mobile Number" required error={errors.phone}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select aria-label="Country code" style={{ ...inputStyle(false), width: 118 }} value={form.country_code} onChange={(e) => setField('country_code', e.target.value)}>
                      {COUNTRY_CODES.map((item) => <option key={item.code} value={item.code}>{item.flag} {item.code}</option>)}
                    </select>
                    <input style={inputStyle(errors.phone)} value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="9876543210" />
                  </div>
                </Field>
                <Field label="Password" required error={errors.password}>
                  <input type={showPassword ? 'text' : 'password'} style={inputStyle(errors.password)} value={form.password} onChange={(e) => setField('password', e.target.value)} />
                </Field>
                <Field label="Confirm Password" required error={errors.confirm_password}>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'} style={inputStyle(errors.confirm_password)} value={form.confirm_password} onChange={(e) => setField('confirm_password', e.target.value)} />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} style={{ position: 'absolute', right: 8, top: 8, border: 0, background: 'transparent', color: '#64748b', cursor: 'pointer' }}>{showPassword ? 'Hide' : 'Show'}</button>
                  </div>
                </Field>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: '#334155' }}>
                    <input type="checkbox" checked={form.terms_accepted} onChange={(e) => setField('terms_accepted', e.target.checked)} />
                    <span>I agree to the Terms and Conditions and Privacy Policy.</span>
                  </label>
                  {errors.terms_accepted ? <span style={{ color: '#dc2626', fontSize: 12 }}>{errors.terms_accepted}</span> : null}
                  <div style={{ marginTop: 14, fontSize: 13 }}>Already have an account? <Link href="/supplier/login" style={{ color: '#1d6fe8', fontWeight: 700 }}>Sign in</Link></div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <p style={{ marginTop: 0, color: '#64748b' }}>Choose the account type that matches how you provide travel services. The later steps and documents change from this choice.</p>
                <div className="sr-grid-2">
                  {[{ id: 'individual', title: 'Individual Person', text: 'For individuals providing tours, activities, experiences, transportation, or other travel-related services.', icon: User }, { id: 'corporate', title: 'Registered Corporate Entity', text: 'For legally registered companies, travel agencies, tour operators, and other registered organizations.', icon: Building2 }].map((option) => {
                    const selected = form.account_type === option.id;
                    const Icon = option.icon;
                    return (
                      <button key={option.id} type="button" onClick={() => setField('account_type', option.id)} style={{ textAlign: 'left', padding: 16, borderRadius: 12, border: selected ? '2px solid #1d6fe8' : '1px solid #e2e8f0', background: selected ? '#eff6ff' : '#fff', cursor: 'pointer' }}>
                        <Icon size={22} color={selected ? '#1d6fe8' : '#64748b'} />
                        <div style={{ fontWeight: 800, marginTop: 8 }}>{option.title}</div>
                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{option.text}</div>
                      </button>
                    );
                  })}
                </div>
                {errors.account_type ? <span style={{ color: '#dc2626', fontSize: 12 }}>{errors.account_type}</span> : null}
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'grid', gap: 14 }}>
                <p style={{ margin: 0, color: '#64748b' }}>Please provide your contact information.</p>
                <div className="sr-grid-2">
                  <Field label="First Name" required error={errors.first_name}>
                    <input style={inputStyle(errors.first_name)} value={form.first_name} onChange={(e) => setField('first_name', e.target.value)} placeholder="John" />
                  </Field>
                  <Field label="Last Name" required error={errors.last_name}>
                    <input style={inputStyle(errors.last_name)} value={form.last_name} onChange={(e) => setField('last_name', e.target.value)} placeholder="Doe" />
                  </Field>
                  <Field label="Email Address" required error={errors.email}>
                    <input type="email" style={inputStyle(errors.email)} value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="john.doe@email.com" />
                  </Field>
                  <Field label="Mobile Number" required error={errors.phone}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select aria-label="Country code" style={{ ...inputStyle(false), width: 118 }} value={form.country_code} onChange={(e) => setField('country_code', e.target.value)}>
                        {COUNTRY_CODES.map((item) => <option key={item.code} value={item.code}>{item.flag} {item.code}</option>)}
                      </select>
                      <input style={inputStyle(errors.phone)} value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="9876543210" />
                    </div>
                  </Field>
                </div>
                <Field label="Contact Address" required error={errors.contact_address}>
                  <input style={inputStyle(errors.contact_address)} value={form.contact_address} onChange={(e) => setField('contact_address', e.target.value)} placeholder="123 Main Street" />
                </Field>
                <div className="sr-grid-2">
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Field label="Country" required error={errors.country}>
                      <select style={inputStyle(errors.country)} value={form.country} onChange={(e) => setField('country', e.target.value)}>
                        <option value="">Select country</option>
                        {COUNTRIES.map((country) => <option key={country}>{country}</option>)}
                      </select>
                    </Field>
                  </div>
                  <Field label="State / Province" required error={errors.state}>
                    <input style={inputStyle(errors.state)} value={form.state} onChange={(e) => setField('state', e.target.value)} placeholder="California" />
                  </Field>
                  <Field label="City" required error={errors.city}>
                    <input style={inputStyle(errors.city)} value={form.city} onChange={(e) => setField('city', e.target.value)} placeholder="Los Angeles" />
                  </Field>
                  <Field label="Postal Code" required error={errors.postal_code}>
                    <input style={inputStyle(errors.postal_code)} value={form.postal_code} onChange={(e) => setField('postal_code', e.target.value)} placeholder="90001" />
                  </Field>
                </div>
              </div>
            )}

            {step === 3 && form.account_type === 'individual' && (
              <div style={{ display: 'grid', gap: 14 }}>
                <p style={{ margin: 0, color: '#64748b' }}>Please provide the following information for your individual supplier account.</p>
                <Field label="Full Legal Name" required error={errors.full_legal_name}>
                  <input style={inputStyle(errors.full_legal_name)} value={form.full_legal_name} onChange={(e) => setField('full_legal_name', e.target.value)} placeholder="John Michael Doe" />
                </Field>
                <Field label="Residential Address" required error={errors.residential_address}>
                  <input style={inputStyle(errors.residential_address)} value={form.residential_address} onChange={(e) => setField('residential_address', e.target.value)} placeholder="123 Main Street, Los Angeles, CA" />
                </Field>
                <div className="sr-grid-2">
                  <Field label="Public Business Name (Display Name)" error={errors.display_name}>
                    <input style={inputStyle(false)} value={form.display_name} onChange={(e) => setField('display_name', e.target.value)} placeholder="Optional" />
                  </Field>
                  <Field label="PAN / Tax Identification Number" error={errors.pan_number}>
                    <input style={inputStyle(false)} value={form.pan_number} onChange={(e) => setField('pan_number', e.target.value)} placeholder="Optional" />
                  </Field>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>Identity Proof <span style={{ color: '#dc2626' }}>*</span></span>
                  <div className="sr-grid-2">
                    <select aria-label="Identity proof type" style={inputStyle(errors.identity_type)} value={form.identity_type} onChange={(e) => setField('identity_type', e.target.value)}>
                      <option value="">Select proof</option>
                      {IDENTITY_TYPES.map((item) => <option key={item}>{item}</option>)}
                    </select>
                    <input aria-label="Identity proof number" style={inputStyle(errors.identity_number)} value={form.identity_number} onChange={(e) => setField('identity_number', e.target.value)} placeholder="AB123456" />
                  </div>
                  {(errors.identity_type || errors.identity_number) ? <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errors.identity_type || errors.identity_number}</div> : null}
                  <div style={{ marginTop: 8, color: '#64748b', fontSize: 12 }}>Upload passport, driving licence, or government ID.</div>
                  <div style={{ marginTop: 8 }}>
                    <InlineProofFile
                      file={form.documents.id_proof}
                      error={errors.doc_id_proof}
                      uploading={uploadingKey === 'id_proof'}
                      onFile={(file) => uploadDocument('id_proof', file)}
                    />
                  </div>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>Address Proof <span style={{ color: '#dc2626' }}>*</span></span>
                  <div style={{ color: '#64748b', fontSize: 12, marginBottom: 8 }}>Upload a utility bill, bank statement, or rental agreement.</div>
                  <InlineProofFile
                    file={form.documents.address_proof}
                    error={errors.doc_address_proof}
                    uploading={uploadingKey === 'address_proof'}
                    onFile={(file) => uploadDocument('address_proof', file)}
                  />
                </div>
              </div>
            )}

            {step === 3 && form.account_type !== 'individual' && (
              <div style={{ display: 'grid', gap: 14 }}>
                <Field label="Registered Legal Business Name" required error={errors.company_name}>
                  <input style={inputStyle(errors.company_name)} value={form.company_name} onChange={(e) => setField('company_name', e.target.value)} />
                </Field>
                <div className="sr-grid-2">
                  <Field label="Public Business / Brand Name" required error={errors.brand_name}>
                    <input style={inputStyle(errors.brand_name)} value={form.brand_name} onChange={(e) => setField('brand_name', e.target.value)} />
                  </Field>
                  <Field label="Business Registration Type" required error={errors.business_type}>
                    <select style={inputStyle(errors.business_type)} value={form.business_type} onChange={(e) => setField('business_type', e.target.value)}>
                      <option value="">Select type</option>
                      {BUSINESS_TYPES.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </Field>
                  <Field label="Business Registration Number" required error={errors.trade_license_no}>
                    <input style={inputStyle(errors.trade_license_no)} value={form.trade_license_no} onChange={(e) => setField('trade_license_no', e.target.value)} />
                  </Field>
                  <Field label="Owner / Authorized Representative" required error={errors.owner_name}>
                    <input style={inputStyle(errors.owner_name)} value={form.owner_name} onChange={(e) => setField('owner_name', e.target.value)} />
                  </Field>
                </div>
                <Field label="Registered Business Address" required error={errors.business_address}>
                  <input style={inputStyle(errors.business_address)} value={form.business_address} onChange={(e) => setField('business_address', e.target.value)} />
                </Field>
                <Field label="GST / Tax Registration Number" required={(form.country || '').toLowerCase() === 'india'} error={errors.tax_id}>
                  <input style={inputStyle(errors.tax_id)} value={form.tax_id} onChange={(e) => setField('tax_id', e.target.value)} placeholder={(form.country || '').toLowerCase() === 'india' ? 'Required for India' : 'Where applicable'} />
                </Field>
                <ProofUpload
                  label="Business Registration Certificate"
                  required
                  hint="Certificate of incorporation or trade licence"
                  file={form.documents.business_registration}
                  error={errors.doc_business_registration}
                  uploading={uploadingKey === 'business_registration'}
                  onFile={(file) => uploadDocument('business_registration', file)}
                />
              </div>
            )}

            {step === 4 && (
              <div>
                <p style={{ marginTop: 0, color: '#64748b' }}>Select every main category you operate in. You can choose more than one.</p>
                <div className="sr-grid-3">
                  {taxonomy.map((category) => {
                    const selected = form.main_categories.includes(category.slug);
                    const image = CATEGORY_IMAGES[category.slug];
                    const theme = CATEGORY_THEMES[category.slug] || ['#334155', '#0f172a'];
                    return (
                      <button
                        key={category.slug}
                        type="button"
                        className={`sr-cat${selected ? ' selected' : ''}`}
                        onClick={() => toggleCategory(category.slug)}
                        style={{ backgroundImage: image ? `url(${image})` : `linear-gradient(135deg, ${theme[0]}, ${theme[1]})` }}
                      >
                        <span className="sr-cat-shade" />
                        {selected ? <span className="sr-cat-check"><Check size={14} /></span> : null}
                        <span className="sr-cat-name">{category.name}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.main_categories ? <span style={{ color: '#dc2626', fontSize: 12 }}>{errors.main_categories}</span> : null}
              </div>
            )}

            {step === 5 && (
              <div style={{ display: 'grid', gap: 26 }}>
                <p style={{ margin: 0, color: '#64748b' }}>Select sub-categories under each selected main category.</p>
                {selectedCategories.map((category) => {
                  const selected = form.sub_selections[category.slug] || { ids: [], names: [], custom: [], other: false };
                  const removeCustom = (name) => setForm((prev) => {
                    const current = prev.sub_selections[category.slug] || selected;
                    return {
                      ...prev,
                      sub_selections: {
                        ...prev.sub_selections,
                        [category.slug]: { ...current, custom: current.custom.filter((item) => item !== name) }
                      }
                    };
                  });
                  return (
                    <div key={category.slug}>
                      <h3 className="sr-group-title">{category.name}</h3>
                      <div className="sr-checks">
                        {category.subcategories.filter((sub) => !sub.is_other).map((sub) => (
                          <label key={sub.name} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <input type="checkbox" checked={selected.names.includes(sub.name)} onChange={() => toggleSubcategory(category, sub)} />
                            <span>{sub.name}</span>
                          </label>
                        ))}
                        {selected.custom.map((name) => (
                          <label key={name} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <input type="checkbox" checked onChange={() => removeCustom(name)} />
                            <span>{name}</span>
                          </label>
                        ))}
                        <OtherSpecify
                          checked={selected.other}
                          onToggle={() => toggleSubcategory(category, { name: 'Other', is_other: true })}
                          value={form.custom_sub_input[category.slug] || ''}
                          onChange={(event) => setForm((prev) => ({ ...prev, custom_sub_input: { ...prev.custom_sub_input, [category.slug]: event.target.value } }))}
                          onAdd={() => addCustomSubcategory(category.slug)}
                          error={errors[`custom_${category.slug}`]}
                        />
                      </div>
                      {errors[`sub_${category.slug}`] ? <div style={{ color: '#dc2626', fontSize: 12, marginTop: 8 }}>{errors[`sub_${category.slug}`]}</div> : null}
                    </div>
                  );
                })}
              </div>
            )}

            {step === 6 && (
              <div style={{ display: 'grid', gap: 26 }}>
                <p style={{ margin: 0, color: '#64748b' }}>Select the services you offer. You can select multiple options.</p>
                {serviceOptions.map((group) => (
                  <div key={group.slug}>
                    <h3 className="sr-group-title">{group.name}</h3>
                    <div className="sr-checks">
                      {group.services.map((service) => (
                        <label key={service} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <input
                            type="checkbox"
                            checked={form.services.includes(service)}
                            onChange={() => setForm((prev) => ({
                              ...prev,
                              services: prev.services.includes(service)
                                ? prev.services.filter((item) => item !== service)
                                : [...prev.services, service]
                            }))}
                          />
                          <span>{service}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="sr-checks">
                  {form.custom_services.map((name) => (
                    <label key={name} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <input type="checkbox" checked onChange={() => setField('custom_services', form.custom_services.filter((item) => item !== name))} />
                      <span>{name}</span>
                    </label>
                  ))}
                  <OtherSpecify
                    checked={form.other_service_selected}
                    onToggle={(event) => setField('other_service_selected', event.target.checked)}
                    value={form.custom_service_input}
                    onChange={(event) => setField('custom_service_input', event.target.value)}
                    onAdd={addCustomService}
                    error={errors.custom_services}
                  />
                </div>
                {errors.services ? <div style={{ color: '#dc2626', fontSize: 12 }}>{errors.services}</div> : null}
                <div>
                  <h3 className="sr-group-title">Add-on Services</h3>
                  <div className="sr-checks">
                    {addOnOptions.map((addon) => (
                      <label key={addon} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <input type="checkbox" checked={form.add_ons.includes(addon)} onChange={() => setForm((prev) => ({ ...prev, add_ons: prev.add_ons.includes(addon) ? prev.add_ons.filter((item) => item !== addon) : [...prev.add_ons, addon] }))} />
                        <span>{addon}</span>
                      </label>
                    ))}
                    {form.custom_addons.map((name) => (
                      <label key={name} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <input type="checkbox" checked onChange={() => setField('custom_addons', form.custom_addons.filter((item) => item !== name))} />
                        <span>{name}</span>
                      </label>
                    ))}
                    <OtherSpecify
                      checked={form.other_addon_selected}
                      onToggle={(event) => setField('other_addon_selected', event.target.checked)}
                      value={form.custom_addon_input}
                      onChange={(event) => setField('custom_addon_input', event.target.value)}
                      onAdd={addCustomAddon}
                      error={errors.custom_addons}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 7 && (
              <Field label="Describe your services" error={errors.description}>
                <textarea rows={7} maxLength={1000} style={{ ...inputStyle(errors.description), resize: 'vertical' }} value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Describe the services you offer, who they are for, and where you operate." />
                <div style={{ textAlign: 'right', color: '#94a3b8', fontSize: 12, marginTop: 4 }}>{form.description.length} / 1000</div>
              </Field>
            )}

            {step === 8 && (
              <div style={{ display: 'grid', gap: 12 }}>
                <p style={{ margin: 0, color: '#64748b' }}>Upload clear PDF, JPG, or PNG copies. Each file must be 10 MB or smaller.</p>
                {docs.map((doc) => (
                  <ProofUpload
                    key={doc.key}
                    label={doc.label}
                    required={doc.required}
                    hint={doc.hint}
                    file={form.documents[doc.key]}
                    error={errors[`doc_${doc.key}`]}
                    uploading={uploadingKey === doc.key}
                    onFile={(file) => uploadDocument(doc.key, file)}
                  />
                ))}
              </div>
            )}

            {step === 9 && (
              <div style={{ display: 'grid', gap: 0 }}>
                <p style={{ margin: '0 0 8px', color: '#64748b' }}>Please review all your information before submitting your application.</p>
                {[
                  ['Account Details', `${form.first_name} ${form.last_name} · ${form.email} · ${form.country_code} ${form.phone}`, 0],
                  ['Account Type', form.account_type === 'individual' ? 'Individual Person' : 'Registered Corporate Entity', 1],
                  ['Contact Information', [form.contact_address, form.city, form.state, form.country, form.postal_code].filter(Boolean).join(', ') || 'Not provided', 2],
                  ['Personal Information', form.account_type === 'individual'
                    ? [form.full_legal_name, form.residential_address, form.display_name, form.pan_number].filter(Boolean).join(' · ')
                    : [form.company_name, form.brand_name, form.business_address].filter(Boolean).join(' · '), 3],
                  ['Categories', selectedCategories.map((category) => category.name).join(', ') || 'None selected', 4],
                  ['Sub-Categories', selectedCategories.flatMap((category) => (form.sub_selections[category.slug]?.names || []).concat(form.sub_selections[category.slug]?.custom || [])).join(', ') || 'None selected', 5],
                  ['Services / Activities', form.services.concat(form.custom_services).join(', ') || 'None selected', 6],
                  ['Add-on Services', form.add_ons.concat(form.custom_addons).join(', ') || 'None selected', 6],
                  ['Description', form.description || 'Not provided', 7],
                  ['Uploaded Documents', docs.filter((doc) => form.documents[doc.key]).map((doc) => form.documents[doc.key].name).join(', ') || 'None uploaded', 8]
                ].map(([label, value, target]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', padding: '14px 0' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: '#64748b', fontWeight: 700 }}>{label}</div>
                      <div style={{ fontSize: 14, marginTop: 4, color: '#0f172a' }}>{value}</div>
                    </div>
                    <button type="button" onClick={() => { setReturnStep(9); goTo(target); }} style={{ border: 0, background: 'transparent', color: '#1d6fe8', fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}>Edit</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 24 }}>
              <button type="button" onClick={leaveStep} style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 8, padding: '11px 16px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <ArrowLeft size={16} /> {returnStep != null ? 'Back to review' : 'Back'}
              </button>
              {step < 9 ? (
                <button type="button" onClick={continueStep} style={{ border: 0, background: '#1d6fe8', color: '#fff', borderRadius: 8, padding: '11px 18px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {returnStep != null ? 'Save' : 'Continue'} {returnStep == null ? <ArrowRight size={16} /> : null}
                </button>
              ) : (
                <button type="button" disabled={submitting} onClick={submitApplication} style={{ border: 0, background: '#1d6fe8', color: '#fff', borderRadius: 8, padding: '11px 18px', fontWeight: 800, cursor: submitting ? 'wait' : 'pointer' }}>
                  {submitting ? 'Submitting…' : 'Submit Application'}
                </button>
              )}
            </div>
          </section>
        )}
      </main>

      {deselectSlug && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, maxWidth: 420 }}>
            <h3 style={{ marginTop: 0 }}>Remove this category?</h3>
            <p style={{ color: '#475569' }}>The sub-categories and custom names selected under this main category will be removed from the application.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" onClick={() => setDeselectSlug('')} style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}>Keep category</button>
              <button type="button" onClick={confirmDeselect} style={{ border: 0, background: '#dc2626', color: '#fff', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}>Remove selections</button>
            </div>
          </div>
        </div>
      )}

      {otpOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 440, textAlign: 'center' }}>
            <h3 style={{ marginTop: 0 }}>Verify your email and mobile</h3>
            <p style={{ color: '#64748b', fontSize: 14 }}>Enter the 6-digit code sent to <strong>{form.email}</strong> and <strong>{form.country_code} {form.phone}</strong>.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  value={digit}
                  inputMode="numeric"
                  maxLength={1}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(-1);
                    const next = [...otp];
                    next[index] = value;
                    setOtp(next);
                    if (value && e.target.nextElementSibling) e.target.nextElementSibling.focus();
                  }}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
                    if (pasted.length) {
                      e.preventDefault();
                      const next = ['', '', '', '', '', ''];
                      pasted.forEach((item, itemIndex) => { next[itemIndex] = item; });
                      setOtp(next);
                    }
                  }}
                  style={{ width: 44, height: 52, textAlign: 'center', fontSize: 20, fontWeight: 800, borderRadius: 8, border: '1px solid #cbd5e1' }}
                />
              ))}
            </div>
            {otpError ? <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 10 }}>{otpError}</div> : null}
            <button type="button" disabled={submitting} onClick={verifyOtp} style={{ width: '100%', border: 0, background: '#1d6fe8', color: '#fff', borderRadius: 8, padding: 12, fontWeight: 800, cursor: 'pointer' }}>
              {submitting ? 'Verifying…' : 'Verify and Submit'}
            </button>
            <button type="button" onClick={resendOtp} disabled={resendIn > 0} style={{ marginTop: 12, border: 0, background: 'transparent', color: resendIn > 0 ? '#94a3b8' : '#1d6fe8', cursor: resendIn > 0 ? 'default' : 'pointer' }}>
              {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
