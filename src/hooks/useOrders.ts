import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DatabaseService } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';
import { OrderStatus, FeedType } from '@/lib/supabase';

export function useOrders(filters?: {
  staff_id?: string;
  supplier_id?: string;
  status?: OrderStatus;
}) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => DatabaseService.getOrders(filters),
    staleTime: 30000, // 30 seconds
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (orderData: {
      supplier_id: string;
      feed_type: FeedType;
      quantity: number;
      price_per_tonne: number;
      reason: string;
      delivery_date?: string;
    }) => DatabaseService.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Order created successfully",
        description: "Your purchase order has been submitted for approval.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create order",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ orderId, status, notes }: {
      orderId: string;
      status: OrderStatus;
      notes?: string;
    }) => DatabaseService.updateOrderStatus(orderId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Order status updated",
        description: "The order status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update order",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}