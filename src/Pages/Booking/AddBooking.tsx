import React, { useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker, Button, Card, Row, Col, Typography, InputNumber, Collapse, Radio, message } from 'antd';
import type { CollapseProps } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useProductAndService } from '../../CustomHooks/useProductAndService';
import { API } from '../../api';
import { END_POINT } from '../../api/UrlProvider';
import dayjs from 'dayjs';
import SelectGroupAntd from '../../components/FormElements/SelectGroup/SelectGroupAntd';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// List of all roles for reference
const allRoles = ["Employee", "BDE", "Sr. BDE", "As. Portfolio Manager", "Portfolio Manager", "Sr. Portfolio Manager", "Team Leader", "AGM", "GM", "AVP", "VP", "AD", "Vertical"];

// Define user interface
interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  [key: string]: string | boolean | undefined;
}

// User tree response interface
interface UserTreeData {
  [role: string]: {
    id: string;
    name: string;
  };
}

export interface PaymentDetail {
  amount: number;
  date: string;
  status: 'paid' | 'unpaid';
  mode: 'cash' | 'cheque' | 'online';
  transactionNo?: string;
  chequeNumber?: string;
}

interface References {
  name:string,
  _id:string
}

export interface BookingData {
  _id: string;
  customer: string;
  leadId: {
    _id: string;
    firstName: string;
    id: string;
  } | null;
  projectName: string;
  email: string;
  contactName: string;
  bookingDate: string | dayjs.Dayjs | null;
  RM: string;
  unit: string;
  size: string;
  reference: {
    employee:  References | null;
    bde: References | null;
    srBDE: References | null;
    asPortfolioManager: References | null;
    portfolioManager: References | null;
    srPortfolioManager: References | null;
    tlcp: References | null;
    avp: References | null;
    vp: References | null;
    ad: References | null;
    agm: References | null;
    gm: References | null;
    vertical: References | null;
  };
  paymentDetails: Array<PaymentDetail>;
  BSP: number;
  GST: number;
  GSTPercentage: number;
  OtherCharges: number;
  OtherGST: number;
  OtherGSTPercentage: number;
  PLC: number;
  PLCGST: number;
  PLCGSTPercentage: number;
  TSP: number;
  totalReceived: number;
  GrossRevenue: number;
  CPRevenue: number;
  Discount: number;
  netRevenue: number;
  remark: string;
  bookingStatus: 'confirmed' | 'pending';
}

export interface BookingFormValues {
  customer: string;
  leadId?: string;
  projectName: string;
  email: string;
  rm: string;
  contactName: string;
  unit: string;
  bookingDate: string | dayjs.Dayjs | null;
  size: string;
  employee: string;
  bde: string;
  srBDE: string;
  asPortfolioManager: string;
  portfolioManager: string;
  srPortfolioManager: string;
  tlcp: string;
  avp: string;
  vp: string;
  ad: string;
  agm: string;
  gm: string;
  vertical: string;
  bsp: number;
  paymentDetails: PaymentDetail[];
  gst: number;
  gstPercentage: number;
  bspGstTotal: number;
  otherGstTotal: number;
  plcGstTotal: number;
  otherCharges: number;
  otherGST: number;
  otherGSTPercentage: number;
  plc: number;
  plcGST: number;
  plcGSTPercentage: number;
  tsp: number;
  totalReceived: number;
  grossRevenue: number;
  cpRevenue: number;
  discount: number;
  netRevenue: number;
  remark: string;
  bookingStatus: 'confirmed' | 'pending';
}

interface AddBookingProps {
  isEditMode?: boolean;
  initialValues?: BookingData | null;
  onFinish?: (values: BookingFormValues & { receivedPayments: PaymentDetail[]; nextPayments: PaymentDetail[] }) => void;
  finalCallBack?: () => void;
}

const AddBooking: React.FC<AddBookingProps> = ({ 
  isEditMode = false, 
  initialValues = null, 
  onFinish: customOnFinish,
  finalCallBack = ()=>{}
}) => {
  const [form] = Form.useForm<BookingFormValues>();
  const [netRevenue, setNetRevenue] = useState<number>(0);
  const [usersByRole, setUsersByRole] = useState<{
    [role: string]: { value: string; label: string }[];
  }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingUserTree, setLoadingUserTree] = useState<boolean>(false);
  const [selectedUserRole, setSelectedUserRole] = useState<string | null>(null);
  
  // State for payment details
  const [receivedPayments, setReceivedPayments] = useState<PaymentDetail[]>([
    { amount: 0, date: '', status: 'paid', mode: 'cash' }
  ]);
  const [nextPayments, setNextPayments] = useState<PaymentDetail[]>([
    { amount: 0, date: '', status: 'unpaid', mode: 'cheque' }
  ]);

  // Sample options for dropdowns
  const { 
    optionList,
    fetchProductServices,
  } = useProductAndService(true);
  
  // Use a useEffect to set form values when in edit mode
  useEffect(() => {
    if (isEditMode && initialValues) {
      // Process initial values
      try {
        // Extract payment details
        const receivedPayments = initialValues.paymentDetails?.length
          ? initialValues.paymentDetails
              .filter((payment: PaymentDetail) => payment.status === 'paid')
              .map((payment: PaymentDetail) => ({
                ...payment,
                date: payment.date || ''
              }))
          : [{ amount: 0, date: '', status: 'paid', mode: 'cash' }];

        const nextPayments = initialValues.paymentDetails?.length
          ? initialValues.paymentDetails
              .filter((payment: PaymentDetail) => payment.status === 'unpaid')
              .map((payment: PaymentDetail) => ({
                ...payment,
                date: payment.date || ''
              }))
          : [{ amount: 0, date: '', status: 'unpaid', mode: 'cheque' }];

        // Set state values
        setReceivedPayments(receivedPayments as PaymentDetail[]);
        setNextPayments(nextPayments as PaymentDetail[]);
        setNetRevenue(initialValues.netRevenue || 0);

        // Set form values with properly formatted date
        form.setFieldsValue({
          customer: initialValues.customer,
          leadId: initialValues.leadId?.id || '',
          projectName: initialValues.projectName,
          email: initialValues.email,
          contactName: initialValues.contactName,
          bookingDate: initialValues.bookingDate ? dayjs(initialValues.bookingDate, 'YYYY-MM-DD') : null,
          rm: initialValues.RM,
          unit: initialValues.unit,
          size: initialValues.size,
          // Reference fields
          employee: initialValues.reference?.employee?._id || undefined,
          bde: initialValues.reference?.bde?._id || undefined,
          srBDE: initialValues.reference?.srBDE?._id || undefined,
          asPortfolioManager: initialValues.reference?.asPortfolioManager?._id || undefined,
          portfolioManager: initialValues.reference?.portfolioManager?._id || undefined,
          srPortfolioManager: initialValues.reference?.srPortfolioManager?._id || undefined,
          tlcp: initialValues.reference?.tlcp?._id || undefined,
          avp: initialValues.reference?.avp?._id || undefined,
          vp: initialValues.reference?.vp?._id || undefined,
          ad: initialValues.reference?.ad?._id || undefined,
          agm: initialValues.reference?.agm?._id || undefined,
          gm: initialValues.reference?.gm?._id || undefined,
          vertical: initialValues.reference?.vertical?._id || undefined,
          // Payment fields
          bsp: initialValues.BSP,
          gst: initialValues.GST,
          gstPercentage: initialValues.GSTPercentage || 10,
          otherCharges: initialValues.OtherCharges,
          otherGST: initialValues.OtherGST,
          otherGSTPercentage: initialValues.OtherGSTPercentage || 10,
          plc: initialValues.PLC,
          plcGST: initialValues.PLCGST,
          plcGSTPercentage: initialValues.PLCGSTPercentage || 10,
          tsp: initialValues.TSP,
          grossRevenue: initialValues.GrossRevenue,
          cpRevenue: initialValues.CPRevenue,
          discount: initialValues.Discount,
          netRevenue: initialValues.netRevenue,
          remark: initialValues.remark,
          bookingStatus: initialValues.bookingStatus
        });
      } catch (error) {
        console.error("Error setting initial values:", error);
        message.error("Failed to load booking details. Please try again.");
      }
    } else {
      // Set default GST percentages for new bookings
      form.setFieldsValue({
        gstPercentage: 10,
        otherGSTPercentage: 10,
        plcGSTPercentage: 10
      });
    }
  }, [isEditMode, initialValues, form]);

  // Modify the onFinish function to handle both add and edit modes
  const onFinish = async (values: BookingFormValues) => {
    if (isEditMode && customOnFinish) {
      // Pass form values along with payment details to the custom onFinish handler
      customOnFinish({
        ...values,
        receivedPayments,
        nextPayments
      });
    } else {
      // Default add booking behavior
      try {
        setLoading(true);
        
        // Calculate total received amount
        const totalReceived = receivedPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        
        // Prepare the booking data according to the expected API format
        const bookingData = {
          customer: values.customer,
          leadId: values.leadId || "", // Optional
          projectName: values.projectName,
          email: values.email,
          contactName: values.contactName,
          bookingDate: values.bookingDate,
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
          paymentDetails: [...receivedPayments, ...nextPayments].map(payment => ({
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
          totalReceived: totalReceived,
          GrossRevenue: values.grossRevenue,
          CPRevenue: values.cpRevenue,
          Discount: values.discount,
          netRevenue: values.netRevenue || netRevenue,
          remark: values.remark,
          bookingStatus: values.bookingStatus
        };
        
        // API call to add booking
        const response = await API.postAuthAPI(bookingData as unknown as string, 'add-booking', true);
        
        if (response.error) throw new Error(response.error);
        
        message.success('Booking added successfully!');
        form.resetFields();
        setReceivedPayments([{ amount: 0, date: '', status: 'paid', mode: 'cash' }]);
        setNextPayments([{ amount: 0, date: '', status: 'unpaid', mode: 'cheque' }]);
        finalCallBack();
        
      } catch (error: unknown) {
        const err = error as Error;
        message.error(err.message || 'Failed to add booking');
      } finally {
        setLoading(false);
      }
    }
  };

  const calculateTotalRevenue = () => {
    // Get base values
    const bsp = form.getFieldValue('bsp') || 0;
    const otherCharges = form.getFieldValue('otherCharges') || 0;
    const plc = form.getFieldValue('plc') || 0;
    
    // Get GST percentages
    const gstPercentage = form.getFieldValue('gstPercentage') || 0;
    const otherGSTPercentage = form.getFieldValue('otherGSTPercentage') || 0;
    const plcGSTPercentage = form.getFieldValue('plcGSTPercentage') || 0;
    
    // Calculate GST values
    const gst = (bsp * gstPercentage / 100);
    const otherGST = (otherCharges * otherGSTPercentage / 100);
    const plcGST = (plc * plcGSTPercentage / 100);
    
    // Update GST fields
    form.setFieldsValue({
      gst,
      otherGST,
      plcGST
    });
    
    // Calculate totals for each row
    const bspTotal = bsp + gst;
    const otherTotal = otherCharges + otherGST;
    const plcTotal = plc + plcGST;

    form.setFieldsValue({
      bspGstTotal: bspTotal,
      otherGstTotal: otherTotal,
      plcGstTotal: plcTotal
    })
    // Calculate TSP as the sum of all totals
    const tsp = bspTotal + otherTotal + plcTotal;
    
    // Update the TSP field
    form.setFieldsValue({
      tsp: tsp
    });
    
    // Get revenue values
    const grossRevenue = form.getFieldValue('grossRevenue') || 0;
    const cpRevenue = form.getFieldValue('cpRevenue') || 0;
    const discount = form.getFieldValue('discount') || 0;
    
    // Calculate net revenue
    const netRevenue = grossRevenue - cpRevenue - discount;
    setNetRevenue(netRevenue);
    
    form.setFieldsValue({
      netRevenue: netRevenue
    });
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await API.getAuthAPI(END_POINT.USERS, true);
      if (error) throw new Error(error);

      // Group users by their role
      const usersByRoleMap: { [role: string]: { value: string; label: string }[] } = {};
      
      // Initialize empty arrays for each role
      allRoles.forEach(role => {
        usersByRoleMap[role] = [];
      });
      
      // Populate users for each role
      data.forEach((user: User) => {
        if (user.isActive && user.role) {
          usersByRoleMap[user.role] = [
            ...(usersByRoleMap[user.role] || []),
            {
              value: user._id,
              label: user.name
            }
          ];
        }
      });
      
      setUsersByRole(usersByRoleMap);
    } catch (error: unknown) {
      const err = error as Error;
      console.error(err.message || "Failed to fetch users");
    }
  };

  // Fetch user tree hierarchy
  const fetchUserTree = async (userId: string) => {
    if (!userId) return;
    
    try {
      setLoadingUserTree(true);
      const response = await API.getAuthAPI(`${END_POINT.GET_USER_TREE}/${userId}`, true);
      
      if (response.error) throw new Error(response.error);
      
      const userTreeData: UserTreeData = response.data;
      
      // Map to collect form values
      const updates: Record<string, string> = {};
      
      // Process the user tree data
      Object.entries(userTreeData).forEach(([role, userData]) => {
        if (role === "Employee") updates.employee = userData.id;
        else if (role === "BDE") updates.bde = userData.id;
        else if (role === "Sr. BDE") updates.srBDE = userData.id;
        else if (role === "As. Portfolio Manager") updates.asPortfolioManager = userData.id;
        else if (role === "Portfolio Manager") updates.portfolioManager = userData.id;
        else if (role === "Sr. Portfolio Manager") updates.srPortfolioManager = userData.id;
        else if (role === "Team Leader") updates.tlcp = userData.id;
        else if (role === "AGM") updates.agm = userData.id;
        else if (role === "GM") updates.gm = userData.id;
        else if (role === "AVP") updates.avp = userData.id;
        else if (role === "VP") updates.vp = userData.id;
        else if (role === "AD") updates.ad = userData.id;
        else if (role === "Vertical") updates.vertical = userData.id;
      });
      
      // Update the form values
      form.setFieldsValue(updates as unknown as Partial<BookingFormValues>);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Failed to fetch user tree:", err.message);
      message.error("Failed to fetch user hierarchy");
    } finally {
      setLoadingUserTree(false);
    }
  };

  // Handle selection of any user in the Reference section
  const handleUserSelect = (value: string, role: string) => {
    setSelectedUserRole(role);
    
    // Fetch user tree if a value is selected
    if (value) {
      fetchUserTree(value);
    }
    
    // Convert role name to corresponding form field name
    const roleToFieldMap: {[key: string]: keyof BookingFormValues} = {
      "Employee": "employee",
      "BDE": "bde",
      "Sr. BDE": "srBDE",
      "As. Portfolio Manager": "asPortfolioManager",
      "Portfolio Manager": "portfolioManager",
      "Sr. Portfolio Manager": "srPortfolioManager",
      "Team Leader": "tlcp",
      "AGM": "agm",
      "GM": "gm",
      "AVP": "avp",
      "VP": "vp",
      "AD": "ad",
      "Vertical": "vertical"
    };
    
    // Update the form value for the selected role
    const fieldName = roleToFieldMap[role];
    if (fieldName) {
      form.setFieldsValue({
        [fieldName]: value
      });
    }
  };

  // Check if a select should be disabled
  // Now disables only lower hierarchy roles based on the selected role
  const shouldDisableSelect = (role: string): boolean => {
    if (!selectedUserRole) return false;
    
    // Create a map of role positions in the hierarchy for comparison
    const roleOrder: { [role: string]: number } = {};
    allRoles.forEach((r, index) => {
      roleOrder[r] = index;
    });
    
    // Only disable roles that are lower in hierarchy (smaller index) than selected role
    // Keep the selected role and higher roles (greater or equal index) enabled
    return roleOrder[role] < roleOrder[selectedUserRole];
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onFieldsChange = () => {
    calculateTotalRevenue();
  };

  useEffect(()=>{
    fetchProductServices()
  },[fetchProductServices])
  
  // Handle payment detail changes for received payments
  const handleReceivedPaymentChange = (index: number, field: keyof PaymentDetail, value: unknown) => {
    const newPayments = [...receivedPayments];
    // Handle date specifically to ensure proper format
    if (field === 'date' && value) {
      newPayments[index] = { 
        ...newPayments[index], 
        [field]: typeof value === 'string' ? value : value.toString() 
      };
    } else {
      newPayments[index] = { ...newPayments[index], [field]: value };
    }
    setReceivedPayments(newPayments);
    
    // Update form field
    form.setFieldsValue({ paymentDetails: [...newPayments, ...nextPayments] });
    
    // If amount is changed, recalculate total
    if (field === 'amount') {
      calculateTotalRevenue();
    }
  };
  
  // Handle payment detail changes for next payments
  const handleNextPaymentChange = (index: number, field: keyof PaymentDetail, value: unknown) => {
    const newPayments = [...nextPayments];
    // Handle date specifically to ensure proper format
    if (field === 'date' && value) {
      newPayments[index] = { 
        ...newPayments[index], 
        [field]: typeof value === 'string' ? value : value.toString() 
      };
    } else {
      newPayments[index] = { ...newPayments[index], [field]: value };
    }
    setNextPayments(newPayments);
    
    // Update form field
    form.setFieldsValue({ paymentDetails: [...receivedPayments, ...newPayments] });
  };
  
  // Add new payment entry
  const addPaymentEntry = (type: 'received' | 'next') => {
    if (type === 'received') {
      setReceivedPayments([...receivedPayments, { amount: 0, date: '', status: 'paid', mode: 'cash' }]);
    } else {
      setNextPayments([...nextPayments, { amount: 0, date: '', status: 'unpaid', mode: 'cheque' }]);
    }
  };
  
  // Remove payment entry
  const removePaymentEntry = (type: 'received' | 'next', index: number) => {
    if (type === 'received') {
      const newPayments = receivedPayments.filter((_, i) => i !== index);
      setReceivedPayments(newPayments);
      form.setFieldsValue({ paymentDetails: [...newPayments, ...nextPayments] });
    } else {
      const newPayments = nextPayments.filter((_, i) => i !== index);
      setNextPayments(newPayments);
      form.setFieldsValue({ paymentDetails: [...receivedPayments, ...newPayments] });
    }
    
    // Recalculate total
    calculateTotalRevenue();
  };

  // Collapse items for received payments
  const receivedPaymentItems: CollapseProps["items"] = [
    {
      key: "1",
      label: "Received Payment",
      children: (
        <div className="space-y-4">
          {receivedPayments.map((payment, index) => (
            <Card key={index} className="mb-4 dark:bg-gray-700">
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="Amount" rules={[{required:true, message:"Please enter amount"  }]}>
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Enter amount"
                      value={payment.amount}
                      onChange={(value) =>
                        handleReceivedPaymentChange(index, "amount", value)
                      }
                      formatter={(value) =>
                        `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) =>
                        value ? Number(value.replace(/[^\d.]/g, "")) : 0
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Date" rules={[{required:true, message:"Please select the date."  }]}>
                    <DatePicker
                      style={{ width: "100%" }}
                      format="YYYY-MM-DD"
                      defaultValue={payment.date ? dayjs(payment.date) : null}
                      onChange={(date) => {
                        // Use a simple approach that won't cause validation errors
                        const dateStr =
                          typeof date === "string"
                            ? date
                            : date?.format("YYYY-MM-DD");
                        handleReceivedPaymentChange(index, "date", dateStr);
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="Status">
                    <Radio.Group
                      value={payment.status}
                      onChange={(e) =>
                        handleReceivedPaymentChange(
                          index,
                          "status",
                          e.target.value
                        )
                      }
                    >
                      <Radio value="paid">Paid</Radio>
                      <Radio value="unpaid">Unpaid</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Payment Mode">
                    <Select
                      value={payment.mode}
                      onChange={(value) =>
                        handleReceivedPaymentChange(index, "mode", value)
                      }
                      style={{ width: "100%" }}
                    >
                      <Option value="cash">Cash</Option>
                      <Option value="cheque">Cheque</Option>
                      <Option value="online">Online</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {payment.mode === "cheque" && (
                <Row>
                  <Col span={24}>
                    <Form.Item label="Cheque Number">
                      <Input
                        placeholder="Enter cheque number"
                        value={payment.chequeNumber}
                        onChange={(e) =>
                          handleReceivedPaymentChange(
                            index,
                            "chequeNumber",
                            e.target.value
                          )
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}

              {payment.mode === "online" && (
                <Row>
                  <Col span={24}>
                    <Form.Item label="Transaction Number">
                      <Input
                        placeholder="Enter transaction number"
                        value={payment.transactionNo}
                        onChange={(e) =>
                          handleReceivedPaymentChange(
                            index,
                            "transactionNo",
                            e.target.value
                          )
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}

              {receivedPayments.length > 1 && (
                <Button
                  danger
                  onClick={() => removePaymentEntry("received", index)}
                  className="mt-2"
                >
                  Remove
                </Button>
              )}
            </Card>
          ))}

          {/* <Button 
            type="dashed" 
            onClick={() => addPaymentEntry('received')}
            block
          >
            Add Payment
          </Button> */}
        </div>
      ),
    },
  ];
  
  // Collapse items for next payments
  const nextPaymentItems: CollapseProps["items"] = [
    {
      key: "1",
      label: "Next Payment",
      children: (
        <div className="space-y-4">
          {nextPayments.map((payment, index) => (
            <Card key={index} className="mb-4 dark:bg-gray-700">
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="Amount">
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Enter amount"
                      value={payment.amount}
                      onChange={(value) =>
                        handleNextPaymentChange(index, "amount", value)
                      }
                      formatter={(value) =>
                        `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) =>
                        value ? Number(value.replace(/[^\d.]/g, "")) : 0
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Date">
                    <DatePicker
                      style={{ width: "100%" }}
                      format="YYYY-MM-DD"
                      defaultValue={payment.date ? dayjs(payment.date) : null}
                      onChange={(date) => {
                        // Use a simple approach that won't cause validation errors
                        const dateStr =
                          typeof date === "string"
                            ? date
                            : date?.format("YYYY-MM-DD");
                        handleNextPaymentChange(index, "date", dateStr);
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="Status">
                    <Radio.Group
                      value={payment.status}
                      onChange={(e) =>
                        handleNextPaymentChange(index, "status", e.target.value)
                      }
                    >
                      <Radio value="paid">Paid</Radio>
                      <Radio value="unpaid">Unpaid</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Payment Mode">
                    <Select
                      value={payment.mode}
                      onChange={(value) =>
                        handleNextPaymentChange(index, "mode", value)
                      }
                      style={{ width: "100%" }}
                    >
                      <Option value="cheque">Cheque</Option>
                      <Option value="online">Online</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {payment.mode === "cheque" && (
                <Row>
                  <Col span={24}>
                    <Form.Item label="Cheque Number">
                      <Input
                        placeholder="Enter cheque number"
                        value={payment.chequeNumber}
                        onChange={(e) =>
                          handleNextPaymentChange(
                            index,
                            "chequeNumber",
                            e.target.value
                          )
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}

              {payment.mode === "online" && (
                <Row>
                  <Col span={24}>
                    <Form.Item label="Transaction Number">
                      <Input
                        placeholder="Enter transaction number"
                        value={payment.transactionNo}
                        onChange={(e) =>
                          handleNextPaymentChange(
                            index,
                            "transactionNo",
                            e.target.value
                          )
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}

              {nextPayments.length > 1 && (
                <Button
                  danger
                  onClick={() => removePaymentEntry("next", index)}
                  className="mt-2"
                >
                  Remove
                </Button>
              )}
            </Card>
          ))}

          <Button type="dashed" onClick={() => addPaymentEntry("next")} block>
            Add Payment
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen dark:bg-gray-800">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFieldsChange={onFieldsChange}
        className="rounded-lg"
      >
        {/* Basic Detail Section */}
        <Card
          className="mb-6 dark:bg-gray-700 dark:border-gray-600"
          title={
            <Title level={4} className="dark:text-white">
              {isEditMode ? "Edit Booking" : "Basic Detail"}
            </Title>
          }
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Customer"
                name="customer"
                rules={[{ required: true, message: "Please enter name" }]}
              >
                <Input placeholder="Enter name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <SelectGroupAntd
                options={optionList || []}
                placeholder="Select Project"
                allowClear
                showSearch
                name="projectName"
                label="Project Name"
                isFormModeOn
              />
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="R.M." name="rm">
                <Input placeholder="Enter RM" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Contact Name"
                name="contactName"
                rules={[
                  { required: true, message: "Please enter contact name" },
                ]}
              >
                <Input placeholder="Enter contact name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Unit" name="unit">
                <Input placeholder="Enter Unit" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Booking Date"
                name="bookingDate"
                rules={[{ required: true, message: "Please select a date" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD"
                  onChange={(date) => {
                    // Use a simple approach that won't cause validation errors
                    // const dateStr = date ? date.format('YYYY-MM-DD') : '';
                    form.setFieldsValue({
                      bookingDate: date,
                    });
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Size" name="size">
                <Input placeholder="Enter Size" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Reference Section */}
        <Card
          className="mb-6 dark:bg-gray-700 dark:border-gray-600"
          title={
            <Title level={4} className="dark:text-white">
              Reference
            </Title>
          }
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Employee"
                name="employee"
                className="dark:text-white"
              >
                <Select
                  showSearch
                  placeholder="Select employee"
                  optionFilterProp="children"
                  className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  onChange={(value) => handleUserSelect(value, "Employee")}
                  disabled={
                    loadingUserTree || selectedUserRole
                      ? shouldDisableSelect("Employee")
                      : false
                  }
                  loading={loadingUserTree}
                >
                  {usersByRole["Employee"]?.map((emp) => (
                    <Option key={emp.value} value={emp.value}>
                      {emp.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="BDE" name="bde" className="dark:text-white">
                <Select
                  showSearch
                  placeholder="Select BDE"
                  optionFilterProp="children"
                  className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  onChange={(value) => handleUserSelect(value, "BDE")}
                  disabled={
                    loadingUserTree || selectedUserRole
                      ? shouldDisableSelect("BDE")
                      : false
                  }
                  loading={loadingUserTree}
                >
                  {usersByRole["BDE"]?.map((bde) => (
                    <Option key={bde.value} value={bde.value}>
                      {bde.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Sr. BDE" name="srBDE" className="dark:text-white">
                <Select
                  showSearch
                  placeholder="Select Sr. BDE"
                  optionFilterProp="children"
                  className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  onChange={(value) => handleUserSelect(value, "Sr. BDE")}
                  disabled={
                    loadingUserTree || selectedUserRole
                      ? shouldDisableSelect("Sr. BDE")
                      : false
                  }
                  loading={loadingUserTree}
                >
                  {usersByRole["Sr. BDE"]?.map((srBde) => (
                    <Option key={srBde.value} value={srBde.value}>
                      {srBde.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="As. Portfolio Manager" name="asPortfolioManager" className="dark:text-white">
                <Select
                  showSearch
                  placeholder="Select As. Portfolio Manager"
                  optionFilterProp="children"
                  className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  onChange={(value) => handleUserSelect(value, "As. Portfolio Manager")}
                  disabled={
                    loadingUserTree || selectedUserRole
                      ? shouldDisableSelect("As. Portfolio Manager")
                      : false
                  }
                  loading={loadingUserTree}
                >
                  {usersByRole["As. Portfolio Manager"]?.map((aspm) => (
                    <Option key={aspm.value} value={aspm.value}>
                      {aspm.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Portfolio Manager" name="portfolioManager" className="dark:text-white">
                <Select
                  showSearch
                  placeholder="Select Portfolio Manager"
                  optionFilterProp="children"
                  className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  onChange={(value) => handleUserSelect(value, "Portfolio Manager")}
                  disabled={
                    loadingUserTree || selectedUserRole
                      ? shouldDisableSelect("Portfolio Manager")
                      : false
                  }
                  loading={loadingUserTree}
                >
                  {usersByRole["Portfolio Manager"]?.map((pm) => (
                    <Option key={pm.value} value={pm.value}>
                      {pm.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Sr. Portfolio Manager" name="srPortfolioManager" className="dark:text-white">
                <Select
                  showSearch
                  placeholder="Select Sr. Portfolio Manager"
                  optionFilterProp="children"
                  className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  onChange={(value) => handleUserSelect(value, "Sr. Portfolio Manager")}
                  disabled={
                    loadingUserTree || selectedUserRole
                      ? shouldDisableSelect("Sr. Portfolio Manager")
                      : false
                  }
                  loading={loadingUserTree}
                >
                  {usersByRole["Sr. Portfolio Manager"]?.map((srpm) => (
                    <Option key={srpm.value} value={srpm.value}>
                      {srpm.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="TL/CP" name="tlcp" className="dark:text-white">
                <Select
                  showSearch
                  placeholder="Select TL/CP"
                  optionFilterProp="children"
                  className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  onChange={(value) => handleUserSelect(value, "Team Leader")}
                  disabled={
                    loadingUserTree || selectedUserRole
                      ? shouldDisableSelect("Team Leader")
                      : false
                  }
                  loading={loadingUserTree}
                >
                  {usersByRole["Team Leader"]?.map((tl) => (
                    <Option key={tl.value} value={tl.value}>
                      {tl.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="AGM" name="agm" className="dark:text-white">
                <Select
                  showSearch
                  placeholder="Select AGM"
                  optionFilterProp="children"
                  className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  onChange={(value) => handleUserSelect(value, "AGM")}
                  disabled={
                    loadingUserTree || selectedUserRole
                      ? shouldDisableSelect("AGM")
                      : false
                  }
                  loading={loadingUserTree}
                >
                  {usersByRole["AGM"]?.map((agm) => (
                    <Option key={agm.value} value={agm.value}>
                      {agm.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="GM" name="gm" className="dark:text-white">
                <Select
                  showSearch
                  placeholder="Select GM"
                  optionFilterProp="children"
                  className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  onChange={(value) => handleUserSelect(value, "GM")}
                  disabled={
                    loadingUserTree || selectedUserRole
                      ? shouldDisableSelect("GM")
                      : false
                  }
                  loading={loadingUserTree}
                >
                  {usersByRole["GM"]?.map((gm) => (
                    <Option key={gm.value} value={gm.value}>
                      {gm.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="AVP" name="avp" className="dark:text-white">
                <Select
                  showSearch
                  placeholder="Select AVP"
                  optionFilterProp="children"
                  className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  onChange={(value) => handleUserSelect(value, "AVP")}
                  disabled={
                    loadingUserTree || selectedUserRole
                      ? shouldDisableSelect("AVP")
                      : false
                  }
                  loading={loadingUserTree}
                >
                  {usersByRole["AVP"]?.map((avp) => (
                    <Option key={avp.value} value={avp.value}>
                      {avp.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="VP" name="vp" className="dark:text-white">
                <Select
                  showSearch
                  placeholder="Select VP"
                  optionFilterProp="children"
                  className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  onChange={(value) => handleUserSelect(value, "VP")}
                  disabled={
                    loadingUserTree || selectedUserRole
                      ? shouldDisableSelect("VP")
                      : false
                  }
                  loading={loadingUserTree}
                >
                  {usersByRole["VP"]?.map((vp) => (
                    <Option key={vp.value} value={vp.value}>
                      {vp.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="AD" name="ad" className="dark:text-white">
                <Select
                  showSearch
                  placeholder="Select AD"
                  optionFilterProp="children"
                  className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  onChange={(value) => handleUserSelect(value, "AD")}
                  disabled={
                    loadingUserTree || selectedUserRole
                      ? shouldDisableSelect("AD")
                      : false
                  }
                  loading={loadingUserTree}
                >
                  {usersByRole["AD"]?.map((ad) => (
                    <Option key={ad.value} value={ad.value}>
                      {ad.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Vertical"
                name="vertical"
                className="dark:text-white"
              >
                <Select
                  showSearch
                  placeholder="Select Vertical"
                  optionFilterProp="children"
                  className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  onChange={(value) => handleUserSelect(value, "Vertical")}
                  disabled={
                    loadingUserTree || selectedUserRole
                      ? shouldDisableSelect("Vertical")
                      : false
                  }
                  loading={loadingUserTree}
                >
                  {usersByRole["Vertical"]?.map((vert) => (
                    <Option key={vert.value} value={vert.value}>
                      {vert.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Payment Detail Section */}
        <Card
          className="mb-6 dark:bg-gray-700 dark:border-gray-600"
          title={
            <Title level={4} className="dark:text-white">
              Payment Detail
            </Title>
          }
        >
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label="BSP" name="bsp">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter BSP"
                  onChange={calculateTotalRevenue}
                  formatter={(value) =>
                    `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    value ? Number(value.replace(/[^\d.]/g, "")) : 0
                  }
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item label="GST %" name="gstPercentage">
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="%"
                      min={0}
                      max={100}
                      onChange={calculateTotalRevenue}
                      formatter={(value) => `${value}%`}
                      parser={(value) =>
                        value ? (Number(value.replace("%", "")) as 0 | 100) : 0
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="GST Value" name="gst">
                    <InputNumber
                      style={{ width: "100%" }}
                      disabled
                      formatter={(value) =>
                        `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) =>
                        value ? Number(value.replace(/[^\d.]/g, "")) : 0
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <Form.Item label="Total" name="bspGstTotal">
                <InputNumber
                  style={{ width: "100%" }}
                  disabled
                  formatter={(value) =>
                    `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    value ? Number(value.replace(/[^\d.]/g, "")) : 0
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label="Other charges" name="otherCharges">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter other charges"
                  onChange={calculateTotalRevenue}
                  formatter={(value) =>
                    `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    value ? Number(value.replace(/[^\d.]/g, "")) : 0
                  }
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item label="GST %" name="otherGSTPercentage">
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="%"
                      min={0}
                      max={100}
                      onChange={calculateTotalRevenue}
                      formatter={(value) => `${value}%`}
                      parser={(value) =>
                        value ? (Number(value.replace("%", "")) as 0 | 100) : 0
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="GST Value" name="otherGST">
                    <InputNumber
                      style={{ width: "100%" }}
                      disabled
                      formatter={(value) =>
                        `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) =>
                        value ? Number(value.replace(/[^\d.]/g, "")) : 0
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <Form.Item label="Total" name="otherGstTotal">
                <InputNumber
                  style={{ width: "100%" }}
                  disabled
                  formatter={(value) =>
                    `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    value ? Number(value.replace(/[^\d.]/g, "")) : 0
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label="PLC" name="plc">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter PLC"
                  onChange={calculateTotalRevenue}
                  formatter={(value) =>
                    `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    value ? Number(value.replace(/[^\d.]/g, "")) : 0
                  }
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item label="GST %" name="plcGSTPercentage">
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="%"
                      min={0}
                      max={100}
                      onChange={calculateTotalRevenue}
                      formatter={(value) => `${value}%`}
                      parser={(value) =>
                        value ? (Number(value.replace("%", "")) as 0 | 100) : 0
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="GST Value" name="plcGST">
                    <InputNumber
                      style={{ width: "100%" }}
                      disabled
                      formatter={(value) =>
                        `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) =>
                        value ? Number(value.replace(/[^\d.]/g, "")) : 0
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <Form.Item label="Total" name="plcGstTotal">
                <InputNumber
                  style={{ width: "100%" }}
                  disabled
                  formatter={(value) =>
                    `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    value ? Number(value.replace(/[^\d.]/g, "")) : 0
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label="Total" name="tsp">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Total"
                  disabled
                  formatter={(value) =>
                    `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    value ? Number(value.replace(/[^\d.]/g, "")) : 0
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
          <Col span={24}>
              <Form.Item label="Received Payment" name="paymentDetails">
                <Collapse items={receivedPaymentItems} className="w-full" />
              </Form.Item>
          </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label="Gross Revenue" name="grossRevenue">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter gross revenue"
                  formatter={(value) =>
                    `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    value ? Number(value.replace(/[^\d.]/g, "")) : 0
                  }
                  onChange={calculateTotalRevenue}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="- CP Revenue" name="cpRevenue">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter CP Revenue"
                  formatter={(value) =>
                    `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    value ? Number(value.replace(/[^\d.]/g, "")) : 0
                  }
                  onChange={calculateTotalRevenue}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="- Discount" name="discount">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter discount"
                  formatter={(value) =>
                    `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    value ? Number(value.replace(/[^\d.]/g, "")) : 0
                  }
                  onChange={calculateTotalRevenue}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label="Net Revenue" name="netRevenue">
                <InputNumber
                  style={{ width: "100%" }}
                  disabled
                  value={netRevenue}
                  formatter={(value) =>
                    `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    value ? Number(value.replace(/[^\d.]/g, "")) : 0
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24} >
              <Form.Item label="Next Payment" name="paymentDetails">
                <Collapse items={nextPaymentItems} className="w-full" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Remark Section */}
        <Card
          className="mb-6 dark:bg-gray-700 dark:border-gray-600"
          title={
            <Title level={4} className="dark:text-white">
              Remark
            </Title>
          }
        >
          <Row>
            <Col span={24}>
              <Form.Item
                label="Booking Status"
                name="bookingStatus"
                className="dark:text-white"
              >
                <Select
                  placeholder="Select a booking status"
                  optionFilterProp="children"
                >
                  <Option value="confirmed">Confirmed</Option>
                  <Option value="pending">Pending</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="remark"
                label="Remark"
                className="dark:text-white"
              >
                <TextArea
                  rows={4}
                  placeholder="Enter any remarks here"
                  className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Submit Button with Loading State */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            icon={<SaveOutlined />}
            className="float-right"
            loading={loading}
          >
            {isEditMode ? "Update Booking" : "Submit"}
          </Button>
        </Form.Item>
      </Form>

      <style>{`
        .ant-select-selector,
        .ant-input,
        .ant-picker,
        .ant-input-number {
          border-radius: 4px !important;
        }
        .dark .ant-select-selector,
        .dark .ant-input,
        .dark .ant-picker,
        .dark .ant-input-number,
        .dark .ant-picker-panel-container {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
          color: white !important;
        }
        .dark .ant-select-arrow,
        .dark .ant-picker-suffix,
        .dark .ant-picker-icon {
          color: white !important;
        }
        .dark .ant-picker-header,
        .dark .ant-picker-content th {
          color: white !important;
        }
        .dark .ant-picker-cell {
          color: rgba(255, 255, 255, 0.7) !important;
        }
        .dark .ant-picker-cell-in-view {
          color: white !important;
        }
        .dark .ant-picker-cell:hover .ant-picker-cell-inner {
          background-color: #4b5563 !important;
        }
        .dark .ant-picker-cell-selected .ant-picker-cell-inner {
          background-color: #1890ff !important;
        }
        .dark .ant-picker-footer,
        .dark .ant-picker-today-btn {
          color: white !important;
        }
        .dark .ant-card-bordered {
          border: 1px solid #4b5563 !important;
        }
        .dark .ant-form-item-label > label {
          color: white !important;
        }
        .dark .ant-select-dropdown {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
        }
        .dark .ant-select-item {
          color: white !important;
        }
        .dark .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
          background-color: #1890ff !important;
        }
        .dark .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
          background-color: #4b5563 !important;
        }
        
        /* Collapse styles */
        .ant-collapse {
          background-color: transparent !important;
          border-radius: 4px !important;
        }
        .dark .ant-collapse {
          background-color: #1f2937 !important;
          border-color: #4b5563 !important;
        }
        .dark .ant-collapse-header {
          color: white !important;
        }
        .dark .ant-collapse-content {
          background-color: #1f2937 !important;
          border-color: #4b5563 !important;
        }
        .dark .ant-collapse-content-box {
          background-color: #1f2937 !important;
        }
        .dark .ant-radio-wrapper {
          color: white !important;
        }
      `}</style>
    </div>
  );
};

AddBooking.defaultProps = {
  isEditMode: false,
  initialValues: null,
  onFinish: undefined
};

export default AddBooking;