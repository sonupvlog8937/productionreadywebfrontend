import { Box, Button, Divider } from "@mui/material";
import { useEffect } from "react";
import PaymentsIcon from "@mui/icons-material/Payments";
import OrderStepper from "./OrderStepper";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
  cancelOrder,
  fetchOrderById,
  fetchOrderItemById,
} from "../../../Redux Toolkit/Customer/OrderSlice";
import { useNavigate, useParams } from "react-router-dom";

const OrderDetails = () => {
  const dispatch = useAppDispatch();
  const { orders } = useAppSelector((store) => store);
  const { orderItemId, orderId } = useParams<{
    orderItemId: string;
    orderId: string;
  }>();
  const navigate = useNavigate();
  const jwt = localStorage.getItem("jwt") || "";

  useEffect(() => {
    if (!orderItemId || !orderId) return;

    dispatch(
      fetchOrderItemById({
        orderItemId,
        jwt,
      })
    );

    dispatch(
      fetchOrderById({
        orderId,
        jwt,
      })
    );
  }, [dispatch, orderItemId, orderId, jwt]);

  if (!orders.orderItem || !orders.currentOrder) {
    return (
      <div className="h-[80vh] flex justify-center items-center">
        No order found
      </div>
    );
  }

  // ✅ FIXED
  const handleCancelOrder = () => {
    if (!orderId) return;

    dispatch(
      cancelOrder({
        orderId,
        jwt,
      })
    );
  };

  return (
    <Box className="space-y-5">
      {/* PRODUCT INFO */}
      <section className="flex flex-col gap-5 justify-center items-center">
        <img
          className="w-[100px]"
          src={orders.orderItem.product.images[0]}
          alt=""
        />
        <div className="text-sm space-y-1 text-center">
          <h1 className="font-bold">
            {
              orders.orderItem.product.seller?.businessDetails
                ?.businessName
            }
          </h1>
          <p>{orders.orderItem.product.title}</p>
        </div>

        <Button
          onClick={() =>
            navigate(
              `/reviews/${orders.orderItem?.product._id}/create`
            )
          }
        >
          Write Review
        </Button>
      </section>

      {/* ORDER STATUS */}
      <section className="border p-5">
        <OrderStepper orderStatus={orders.currentOrder.orderStatus} />
      </section>

      {/* ADDRESS */}
      <div className="border p-5">
        <h1 className="font-bold pb-3">Delivery Address</h1>
        <p>
          {orders.currentOrder.shippingAddress.address},{" "}
          {orders.currentOrder.shippingAddress.city},{" "}
          {orders.currentOrder.shippingAddress.state} -{" "}
          {orders.currentOrder.shippingAddress.pinCode}
        </p>
      </div>

      {/* PRICE */}
      <div className="border space-y-4">
        <div className="flex justify-between px-5 pt-5">
          <p className="font-bold">Total Price</p>
          <p>₹{orders.orderItem.sellingPrice}</p>
        </div>

        <div className="px-5">
          <div className="bg-teal-50 px-5 py-2 flex gap-2 items-center">
            <PaymentsIcon />
            <p>Cash on Delivery</p>
          </div>
        </div>

        <Divider />

        <div className="p-10">
          <Button
            disabled={orders.currentOrder.orderStatus === "CANCELLED"}
            onClick={handleCancelOrder}
            color="error"
            variant="outlined"
            fullWidth
          >
            {orders.currentOrder.orderStatus === "CANCELLED"
              ? "Order Cancelled"
              : "Cancel Order"}
          </Button>
        </div>
      </div>
    </Box>
  );
};

export default OrderDetails;
