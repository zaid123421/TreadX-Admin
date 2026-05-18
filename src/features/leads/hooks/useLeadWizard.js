import { useState, useEffect, useCallback,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { leadsService } from '../services/leadsApiService';

import {
  fetchCountries,
  fetchProvincesByCountry,
  fetchCitiesByProvince,
  parseAddressSelectValue,
} from '@/shared/services/addressApiService';
import { validatePostalCode, validatePhoneNumber, validateStreetNumber } from '../utils/leadUtils';
import { normalizeLeadToForm, buildNotesForApi } from '../utils/leadFormUtils';

export function useLeadWizard({ initialData = null, isEdit = false, onSuccess, onClose }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => normalizeLeadToForm(initialData));
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [countriesError, setCountriesError] = useState(null);
  const [provincesError, setProvincesError] = useState(null);
  const [citiesError, setCitiesError] = useState(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    setFormData(normalizeLeadToForm(initialData));
  }, [initialData]);



// 1. جلب الدول (عند فتح الصفحة أول مرة فقط)
useEffect(() => {
  let cancelled = false;
  (async () => {
    try {
      setLoadingCountries(true);
      const list = await fetchCountries();
      if (!cancelled) setCountries(list);
    } catch (e) {
      if (!cancelled) setCountries([]);
    } finally {
      if (!cancelled) setLoadingCountries(false);
    }
  })();
  return () => { cancelled = true; };
}, []);

// 2. جلب المحافظات عند تغيير الدولة
useEffect(() => {
  if (formData.countryId == null || formData.countryId === '') {
    setProvinces([]);
    return;
  }
  
  let cancelled = false;
  (async () => {
    try {
      setLoadingProvinces(true);
      const list = await fetchProvincesByCountry(formData.countryId);
      if (!cancelled) {
        setProvinces(list);
        
        // إذا لم يكن التحميل الأول والـ countryId تغير يدوياً، هنا فقط نُصفّر الباقي
        if (!isInitialMount.current) {
          const hasCurrentState = list.some(p => String(p.id) === String(formData.stateId));
          if (!hasCurrentState) {
            setFormData(prev => ({ ...prev, stateId: null, cityId: null }));
          }
        }
      }
    } catch (e) {
      if (!cancelled) setProvinces([]);
    } finally {
      if (!cancelled) setLoadingProvinces(false);
    }
  })();
  
  return () => { cancelled = true; };
}, [formData.countryId]);

// 3. جلب المدن عند تغيير المحافظة
useEffect(() => {
  if (formData.stateId == null || formData.stateId === '') {
    setCities([]);
    return;
  }

  let cancelled = false;
  (async () => {
    try {
      setLoadingCities(true);
      const list = await fetchCitiesByProvince(formData.stateId);
      if (!cancelled) {
        setCities(list);
        
        // إذا لم يكن التحميل الأول وتغيرت المحافظة يدوياً، نُصفّر المدينة
        if (!isInitialMount.current) {
          const hasCurrentCity = list.some(c => String(c.id) === String(formData.cityId));
          if (!hasCurrentCity) {
            setFormData(prev => ({ ...prev, cityId: null }));
          }
        } else {
          // بمجرد انتهاء تحميل المدن في أول ريندر للتعديل، نغلق بوابة التحميل الأول
          isInitialMount.current = false;
        }
      }
    } catch (e) {
      if (!cancelled) setCities([]);
    } finally {
      if (!cancelled) setLoadingCities(false);
    }
  })();

  return () => { cancelled = true; };
}, [formData.stateId]);

// 💡 عند تغيير الـ initialData (مثلاً بعد جلب البيانات من السيرفر) نُعيد تفعيل حماية التحميل الأول
useEffect(() => {
  if (initialData) {
    isInitialMount.current = true;
    setFormData(normalizeLeadToForm(initialData));
  }
}, [initialData]); // تعتمد فقط على الـ stateId

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (errors.submit) setErrors((prev) => ({ ...prev, submit: undefined }));
  };

  const handleCountryChange = useCallback((value) => {
    const id = parseAddressSelectValue(value);
    setFormData((prev) => ({
      ...prev,
      countryId: id,
      stateId: null,
      cityId: null,
    }));
    setErrors((prev) => ({
      ...prev,
      countryId: undefined,
      stateId: undefined,
      cityId: undefined,
      submit: undefined,
    }));
  }, []);

  const handleStateChange = useCallback((value) => {
    const id = parseAddressSelectValue(value);
    setFormData((prev) => ({
      ...prev,
      stateId: id,
      cityId: null,
    }));
    setErrors((prev) => ({
      ...prev,
      stateId: undefined,
      cityId: undefined,
      submit: undefined,
    }));
  }, []);

  const handleCityChange = useCallback((value) => {
    const id = parseAddressSelectValue(value);
    setFormData((prev) => ({ ...prev, cityId: id }));
    setErrors((prev) => ({ ...prev, cityId: undefined, submit: undefined }));
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    if (file) handleInputChange('uploadedFile', file.name);
  };

  const validateForm = () => {
    const next = {};
    /** API / state may use numbers; `.trim()` only exists on strings. */
    const t = (v) => String(v ?? '').trim();
    const businessName = t(formData.businessName);
    const phoneNumber = t(formData.phoneNumber);
    const streetNumber = t(formData.streetNumber);
    const streetName = t(formData.streetName);
    const postalCode = t(formData.postalCode);

    if (!businessName) next.businessName = 'Business name is required';
    if (!phoneNumber) next.phoneNumber = 'Phone number is required';
    else if (!validatePhoneNumber(phoneNumber))
      next.phoneNumber = 'Please enter a valid Canadian phone number';
    if (!streetNumber) next.streetNumber = 'Street number is required';
    else if (!validateStreetNumber(streetNumber))
      next.streetNumber = 'Street number must contain only numbers';
    if (!streetName) next.streetName = 'Street name is required';
    if (!postalCode) next.postalCode = 'Postal code is required';
    else if (!validatePostalCode(postalCode))
      next.postalCode = 'Please enter a valid Canadian postal code (e.g., A1A 1A1)';
    if (!formData.countryId) next.countryId = 'Select a country';
    if (!formData.stateId) next.stateId = 'Select a state or province';
    if (!formData.cityId) next.cityId = 'Select a city';
    if (!formData.source) next.source = 'Lead source is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    setErrors((e) => ({ ...e, submit: undefined }));

    const payload = { ...formData, notes: buildNotesForApi(formData) };

    try {
      let result;
      if (isEdit) {
        result = await leadsService.updateLead(formData.id, payload, selectedFile);
      } else {
        result = await leadsService.createLead(payload, selectedFile);
      }
      if (onSuccess) onSuccess(result);
      else navigate('/leads');
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputError = (name) => (errors[name] ? 'border-destructive ring-destructive/30' : '');

  return {
    formData,
    selectedFile,
    errors,
    isSubmitting,
    countries,
    provinces,
    cities,
    loadingCountries,
    loadingProvinces,
    loadingCities,
    countriesError,
    provincesError,
    citiesError,
    handleInputChange,
    handleCountryChange,
    handleStateChange,
    handleCityChange,
    handleFileChange,
    handleSubmit,
    inputError,
    onClose,
  };
}
