import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { message, Spin } from 'antd';
import { API } from '../../api';
import { END_POINT } from '../../api/UrlProvider';
import AddBooking from './AddBooking';
import { BookingFormValues, PaymentDetail, BookingData } from './AddBooking';

const EditBooking: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  // Fetch booking details when component mounts
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const response = await API.getAuthAPI(`get-booking-details/${bookingId}`, true);
        
        if (response.error) {
          throw new Error(response.message || 'Failed to fetch booking details');
        }
        
        setBookingData(response.data);
      } catch (error) {
        message.error(typeof error === 'object' && error !== null && 'message' in error 
          ? (error as Error).message 
          : 'Failed to fetch booking details');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  // Handle form submission for updating booking
  const handleUpdateBooking = async (values: BookingFormValues & { receivedPayments: PaymentDetail[]; nextPayments: PaymentDetail[] }) => {
    try {
      setLoading(true);
      
      // Extract payment details
      const receivedPayments = values.receivedPayments || [];
      const nextPayments = values.nextPayments || [];
      
      // Combine received and next payments
      const paymentDetails = [...receivedPayments, ...nextPayments];
      
      // Format data for API
      const bookingUpdateData = {
        customer: values.customer,
        leadId: values.leadId || '',
        projectName: values.projectName,
        email: values.email,
        contactName: values.contactName,
        bookingDate: typeof values.bookingDate === 'object' && values.bookingDate !== null 
          ? values.bookingDate.format('YYYY-MM-DD') 
          : values.bookingDate,
        RM: values.rm,
        unit: values.unit,
        size: values.size,
        reference: {
          employee: values.employee,
          bde: values.bde,
          srBDE: values.srBDE,
          asPortfolioManager: values.asPortfolioManager,
          portfolioManager: values.portfolioManager,
          srPortfolioManager: values.srPortfolioManager,
          tlcp: values.tlcp,
          avp: values.avp,
          vp: values.vp,
          ad: values.ad,
          agm: values.agm,
          gm: values.gm,
          vertical: values.vertical
        },
        paymentDetails: paymentDetails.map(payment => ({
          amount: payment.amount,
          date: payment.date,
          status: payment.status,
          mode: payment.mode,
          ...(payment.mode === 'online' && { transactionNo: payment.transactionNo }),
          ...(payment.mode === 'cheque' && { chequeNumber: payment.chequeNumber })
        })),
        BSP: values.bsp,
        GST: values.gst,
        GSTPercentage: values.gstPercentage,
        OtherCharges: values.otherCharges,
        OtherGST: values.otherGST,
        OtherGSTPercentage: values.otherGSTPercentage,
        PLC: values.plc,
        PLCGST: values.plcGST,
        PLCGSTPercentage: values.plcGSTPercentage,
        TSP: values.tsp,
        totalReceived: values.totalReceived,
        GrossRevenue: values.grossRevenue,
        CPRevenue: values.cpRevenue,
        Discount: values.discount,
        netRevenue: values.netRevenue,
        remark: values.remark,
        bookingStatus: values.bookingStatus
      };
      
      // API call to update booking - using the correct case for PutAuthAPI
      const response = await API.PutAuthAPI(
        bookingUpdateData,
        bookingId || null,
        END_POINT.UPDATE_BOOKING,
        true
      );
      
      if (response.error) {
        throw new Error(response.message || 'Failed to update booking');
      }
      
      message.success('Booking updated successfully!');
    } catch (error) {
      message.error(typeof error === 'object' && error !== null && 'message' in error 
        ? (error as Error).message 
        : 'Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !bookingData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Loading booking details..." />
      </div>
    );
  }
  

  return (
    <AddBooking 
      isEditMode={true}
      initialValues={bookingData} 
      onFinish={handleUpdateBooking} 
    />
  );
};

export default EditBooking; 