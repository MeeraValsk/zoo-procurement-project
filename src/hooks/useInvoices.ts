import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DatabaseService } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';
import { InvoiceStatus } from '@/lib/supabase';

export function useInvoices(filters?: {
  supplier_id?: string;
  status?: InvoiceStatus;
}) {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => DatabaseService.getInvoices(filters),
    staleTime: 30000, // 30 seconds
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (invoiceData: {
      order_id: string;
      amount: number;
      invoice_date: string;
      due_date?: string;
      notes?: string;
    }) => DatabaseService.createInvoice(invoiceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: "Invoice created successfully",
        description: "The invoice has been submitted for verification.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create invoice",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ invoiceId, status, notes }: {
      invoiceId: string;
      status: InvoiceStatus;
      notes?: string;
    }) => DatabaseService.updateInvoiceStatus(invoiceId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: "Invoice status updated",
        description: "The invoice status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update invoice",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}