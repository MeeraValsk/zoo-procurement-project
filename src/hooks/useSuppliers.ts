import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DatabaseService } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';

export function useSuppliers(activeOnly = true) {
  return useQuery({
    queryKey: ['suppliers', activeOnly],
    queryFn: () => DatabaseService.getSuppliers(activeOnly),
    staleTime: 300000, // 5 minutes
  });
}

export function useFeedPricing(supplierId?: string) {
  return useQuery({
    queryKey: ['feed-pricing', supplierId],
    queryFn: () => DatabaseService.getFeedPricing(supplierId),
    staleTime: 300000, // 5 minutes
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (supplierData: {
      name: string;
      contact_person: string;
      email: string;
      phone: string;
      address: string;
    }) => DatabaseService.createSupplier(supplierData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Supplier created successfully",
        description: "The new supplier has been added to the system.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create supplier",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}