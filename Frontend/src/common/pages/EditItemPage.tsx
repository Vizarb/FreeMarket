import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
// import { useAppDispatch } from '@/store/hooks/hooks';
import { toast } from 'sonner';

const EditItemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
//   const dispatch = useAppDispatch();

  useEffect(() => {
    if (!id) {
      toast.error('Missing item ID.');
      return;
    }

    // dispatch(fetchItemById(Number(id))) <-- create this later
  }, [id]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Item</h1>
      <p>Item ID: {id}</p>
      <p>Form coming soon.</p>
    </div>
  );
};

export default EditItemPage;
