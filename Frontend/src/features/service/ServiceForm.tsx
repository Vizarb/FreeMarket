import React, { useState } from 'react';
import { useItemFormFields } from '@/features/item/useItemFormFields';
import BaseItemFormLayout from '@/common/forms/BaseItemFormLayout';
import { toast } from 'sonner';
import { ServiceType } from '@/types/enums';

interface ServiceFormProps {
  mode?: 'create' | 'edit';
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  mode = 'create',
  onSubmit,
  isSubmitting,
}) => {
  const {
    name, setName,
    description, setDescription,
    priceCents, setPriceCents,
    currency, setCurrency,
    image, setImage,
  } = useItemFormFields();

  const [serviceDuration, setServiceDuration] = useState<number>(60);
  const [serviceType, setServiceType] = useState<string>('Other');

  const handleSubmit = (formData: FormData) => {
    // Service-specific validation
    if (serviceDuration <= 0) {
      toast.error("Service duration must be positive.");
      return;
    }

    if (!serviceType.trim()) {
      toast.error("Service type is required.");
      return;
    }

    formData.append('service_duration', serviceDuration.toString());
    formData.append('service_type', serviceType);

    onSubmit(formData);
  };

  return (
    <BaseItemFormLayout
      name={name}
      setName={setName}
      description={description}
      setDescription={setDescription}
      priceCents={priceCents}
      setPriceCents={setPriceCents}
      currency={currency}
      setCurrency={setCurrency}
      image={image}
      setImage={setImage}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      title={mode === 'edit' ? 'Edit Service' : 'Add New Service'}
    >
      {/* Service-specific fields */}
      <div>
        <label className="block font-medium mb-1">Service Duration (minutes)</label>
        <input
          type="number"
          value={serviceDuration}
          onChange={(e) => setServiceDuration(Number(e.target.value))}
          className="border p-2 w-full rounded"
          required
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Service Type</label>
        <select
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value as ServiceType)}
          className="border p-2 w-full rounded"
        >
          {Object.values(ServiceType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
    </BaseItemFormLayout>
  );
};

export default ServiceForm;
