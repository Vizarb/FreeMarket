import React from 'react';
import { useItemFormFields } from '@/features/item/useItemFormFields';
import BaseItemFormLayout from '@/common/forms/BaseItemFormLayout';

interface ProductFormProps {
  mode?: 'create' | 'edit';
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
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
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      title={mode === 'edit' ? 'Edit Product' : 'Add New Product'}
    />
  );
};

export default ProductForm;
