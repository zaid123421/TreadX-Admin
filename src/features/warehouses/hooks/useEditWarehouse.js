import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import {
  fetchCountries,
  fetchProvincesByCountry,
  fetchCitiesByProvince,
  resolveAddressIdsFromNames,
} from '@/shared/services/addressApiService';
import { warehousesService } from '../services/warehousesApiService';
import {
  validateWarehouseEditForm,
  buildWarehouseUpdatePayload,
  normalizeWarehouseToEditForm,
  computeEditChecklistSteps,
} from '../utils/warehouseFormUtils';

export function useEditWarehouse({ warehouse, onSuccess, onClose }) {
  const [formData, setFormData] = useState(() => normalizeWarehouseToEditForm(warehouse));
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);

  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const isInitialMount = useRef(true);
  const formDataRef = useRef(formData);
  formDataRef.current = formData;
  const warehouseId = warehouse?.id;

  useEffect(() => {
    if (!warehouse) return;
    isInitialMount.current = true;
    setFormData(normalizeWarehouseToEditForm(warehouse));
    setErrors({});

    let cancelled = false;
    (async () => {
      setIsResolvingAddress(true);
      try {
        const ids = await resolveAddressIdsFromNames(warehouse.address);
        if (!cancelled) {
          setFormData((prev) => ({ ...prev, ...ids }));
        }
      } catch {
        if (!cancelled) {
          toast.error('Could not resolve address IDs — please re-select location');
        }
      } finally {
        if (!cancelled) setIsResolvingAddress(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Intentionally key off id so reference changes do not wipe in-progress edits
  }, [warehouseId]);

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
          if (!isInitialMount.current) {
            const hasState = list.some((p) => String(p.id) === String(formData.stateId));
            if (!hasState) {
              setFormData((prev) => ({ ...prev, stateId: null, cityId: null }));
            }
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
          if (!isInitialMount.current) {
            const hasCity = list.some((c) => String(c.id) === String(formData.cityId));
            if (!hasCity) {
              setFormData((prev) => ({ ...prev, cityId: null }));
            }
          } else {
            isInitialMount.current = false;
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

  const checklist = useMemo(() => computeEditChecklistSteps(formData), [formData]);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, submit: undefined }));
  }, []);

  const handleCountryChange = useCallback((value) => {
    const id = value == null || value === '' ? null : String(value);
    isInitialMount.current = false;
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
    const id = value == null || value === '' ? null : String(value);
    isInitialMount.current = false;
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
    const id = value == null || value === '' ? null : String(value);
    setFormData((prev) => ({ ...prev, cityId: id }));
    setErrors((prev) => ({ ...prev, cityId: undefined, submit: undefined }));
  }, []);

  const handleSubmit = async () => {
    const data = formDataRef.current;
    const nextErrors = validateWarehouseEditForm(data);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const payload = buildWarehouseUpdatePayload(data);
      await warehousesService.updateWarehouse(warehouse.id, payload);
      toast.success(`"${data.warehouseName}" updated successfully`);
      onSuccess?.();
    } catch (error) {
      setErrors((prev) => ({ ...prev, submit: error.message }));
      toast.error(error.message || 'Failed to update warehouse');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputError = (name) => (errors[name] ? 'border-destructive ring-destructive/30' : '');

  return {
    formData,
    errors,
    isSubmitting,
    isResolvingAddress,
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
