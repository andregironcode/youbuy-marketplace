import { OrderTracker } from "@/components/purchases/OrderTracker";
import { TrackingUpdate } from "@/components/sales/TrackingUpdate";
import { DriverPanel } from "@/components/delivery/DriverPanel";
import { DeliveryRoutes } from "@/components/admin/pages/DeliveryRoutes";

export default function TestPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Component Testing</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Order Tracker</h2>
          <OrderTracker orderId="test-order-1" />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Tracking Update</h2>
          <TrackingUpdate 
            orderId="test-order-1"
            currentStatus="pending"
            onUpdateSuccess={() => alert("Update successful!")}
          />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Driver Panel</h2>
          <DriverPanel />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Delivery Routes</h2>
          <DeliveryRoutes />
        </section>
      </div>
    </div>
  );
} 