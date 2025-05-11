// src/features/item/useItemFormFields.ts
import { Currency } from '@/types/enums';
import { useState } from 'react';

interface UseItemFormFieldsReturn {
  name: string;
  setName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  priceCents: number;
  setPriceCents: (value: number) => void;
  currency: Currency;
  setCurrency: (value: Currency) => void;
  image: File | null;
  setImage: (value: File | null) => void;
}

export function useItemFormFields(): UseItemFormFieldsReturn {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceCents, setPriceCents] = useState(0);
  const [currency, setCurrency] = useState<Currency>(Currency.USD);
  const [image, setImage] = useState<File | null>(null);

  return {
    name,
    setName,
    description,
    setDescription,
    priceCents,
    setPriceCents,
    currency,
    setCurrency,
    image,
    setImage,
  };
}
