import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  fetchCountries,
  fetchProvincesByCountry,
  fetchCitiesByProvince,
  parseAddressSelectValue,
} from '@/shared/services/addressApiService';
import { warehousesService } from '../services/warehousesApiService';
import { DEFAULT_WAREHOUSE_FORM } from '../types/warehouseDefaults';
import {
  validateWarehouseForm,
  buildWarehousePayload,
  computeChecklistSteps,
} from '../utils/warehouseFormUtils';

export function useProvisionWarehouse({ onSuccess, onClose }) {
  const [formData, setFormData] = useState(DEFAULT_WAREHOUSE_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingCountries(true);
        const list = await fetchCountries();
        if (!cancelled) setCountries(list);
      } catch {
        if (!cancelled) setCountries([]);
      } finally {
        if (!cancelled) setLoadingCountries(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
          const hasState = list.some((p) => String(p.id) === String(formData.stateId));
          if (!hasState) {
            setFormData((prev) => ({ ...prev, stateId: null, cityId: null }));
          }
        }
      } catch {
        if (!cancelled) setProvinces([]);
      } finally {
        if (!cancelled) setLoadingProvinces(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [formData.countryId]);

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
          const hasCity = list.some((c) => String(c.id) === String(formData.cityId));
          if (!hasCity) {
            setFormData((prev) => ({ ...prev, cityId: null }));
          }
        }
      } catch {
        if (!cancelled) setCities([]);
      } finally {
        if (!cancelled) setLoadingCities(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [formData.stateId]);

  const checklist = useMemo(() => computeChecklistSteps(formData), [formData]);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, submit: undefined }));
  }, []);

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

  const handleSubmit = async () => {
    const nextErrors = validateWarehouseForm(formData);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const payload = buildWarehousePayload(formData);
      const result = await warehousesService.createWarehouse(payload);
      toast.success(`Warehouse "${formData.warehouseName}" provisioned successfully`);
      onSuccess?.(result);
    } catch (error) {
      setErrors((prev) => ({ ...prev, submit: error.message }));
      toast.error(error.message || 'Failed to provision warehouse');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputError = (name) => (errors[name] ? 'border-destructive ring-destructive/30' : '');

  return {
    formData,
    errors,
    isSubmitting,
    countries,
    provinces,
    cities,
    loadingCountries,
    loadingProvinces,
    loadingCities,
    checklist,
    handleInputChange,
    handleCountryChange,
    handleStateChange,
    handleCityChange,
    handleSubmit,
    inputError,
    onClose,
  };
}
