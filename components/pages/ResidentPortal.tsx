"use client"
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { 
  IndianRupee, 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  Building2,
  Phone,
  Hash,
  AlertCircle,
  Clock,
  Repeat
} from "lucide-react";
import { toast } from "sonner";

interface ResidentData {
  roomNumber: string;
  name: string;
  phone: string;
  rentAmount: number;
  dueDate: string;
  status: "paid" | "due" | "overdue";
  autoPayEnabled: boolean;
}

export function ResidentPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({
    roomNumber: "",
    phone: ""
  });
  const [residentData, setResidentData] = useState<ResidentData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking">("card");
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    upiId: ""
  });
  const [showAutopaySetup, setShowAutopaySetup] = useState(false);
  const [autopayMethod, setAutopayMethod] = useState<"card" | "upi">("card");
  const [autopayData, setAutopayData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    upiId: ""
  });

  // Mock login - in real app, this would verify with backend
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate authentication
    if (loginData.roomNumber && loginData.phone.length === 10) {
      // Mock resident data
      const mockResident: ResidentData = {
        roomNumber: loginData.roomNumber,
        name: "John Doe",
        phone: loginData.phone,
        rentAmount: 8000,
        dueDate: "2026-03-25",
        status: "due",
        autoPayEnabled: false
      };
      
      setResidentData(mockResident);
      setIsLoggedIn(true);
      toast.success("Login successful!");
    } else {
      toast.error("Invalid credentials. Please check your details.");
    }
  };

  const handlePayRent = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, process payment through gateway
    toast.success("Rent payment successful! Receipt sent to your email.");
    
    if (residentData) {
      setResidentData({
        ...residentData,
        status: "paid",
        dueDate: "2026-04-25"
      });
    }
  };

  const handleSetupAutopay = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (residentData) {
      setResidentData({
        ...residentData,
        autoPayEnabled: true
      });
      setShowAutopaySetup(false);
      toast.success("AutoPay setup successful! Your rent will be automatically deducted on the 25th of each month.");
    }
  };

  const handleDisableAutopay = () => {
    if (residentData) {
      setResidentData({
        ...residentData,
        autoPayEnabled: false
      });
      toast.success("AutoPay disabled successfully.");
    }
  };

  // Login View
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Resident Portal</CardTitle>
            <CardDescription>
              Login to pay your monthly rent and manage autopay
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="roomNumber">Room Number *</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="roomNumber"
                    required
                    value={loginData.roomNumber}
                    onChange={(e) => setLoginData({ ...loginData, roomNumber: e.target.value })}
                    placeholder="101"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Registered Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    required
                    maxLength={10}
                    value={loginData.phone}
                    onChange={(e) => setLoginData({ ...loginData, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="9876543210"
                    className="pl-10"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg">
                Login to Portal
              </Button>
              <p className="text-xs text-center text-gray-500">
                For new bookings, please visit the <a href="/rooms" className="text-blue-600 hover:underline">Rooms page</a>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Resident Dashboard View
  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {residentData?.name}!</h1>
              <p className="text-gray-600 mt-1">Room #{residentData?.roomNumber}</p>
            </div>
            <Button variant="outline" onClick={() => setIsLoggedIn(false)}>
              Logout
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Rent Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rent Status Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Current Rent Status</CardTitle>
                  <Badge
                    variant={
                      residentData?.status === "paid"
                        ? "default"
                        : residentData?.status === "overdue"
                        ? "destructive"
                        : "secondary"
                    }
                    className={
                      residentData?.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : residentData?.status === "due"
                        ? "bg-yellow-100 text-yellow-700"
                        : ""
                    }
                  >
                    {residentData?.status === "paid"
                      ? "Paid"
                      : residentData?.status === "overdue"
                      ? "Overdue"
                      : "Due"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Monthly Rent</p>
                    <div className="flex items-center text-2xl font-bold">
                      <IndianRupee className="h-5 w-5" />
                      {residentData?.rentAmount.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">
                      {residentData?.status === "paid" ? "Next Due Date" : "Due Date"}
                    </p>
                    <div className="flex items-center text-lg font-semibold">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(residentData?.dueDate || "").toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </div>
                  </div>
                </div>

                {residentData?.status === "paid" ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">Rent Paid Successfully</p>
                      <p className="text-sm text-green-700 mt-1">
                        Your rent for this month has been paid. Next payment due on {new Date(residentData?.dueDate || "").toLocaleDateString("en-IN")}.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900">Payment Due</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Please pay your rent before the due date to avoid late fees.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Form */}
            {residentData?.status !== "paid" && (
              <Card>
                <CardHeader>
                  <CardTitle>Pay Monthly Rent</CardTitle>
                  <CardDescription>
                    Make your monthly rent payment securely
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePayRent} className="space-y-6">
                    {/* Payment Method Selection */}
                    <div>
                      <Label className="mb-3 block">Select Payment Method</Label>
                      <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                        <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                          <RadioGroupItem value="card" id="rent-card" />
                          <Label htmlFor="rent-card" className="flex-1 cursor-pointer flex items-center">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Credit / Debit Card
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                          <RadioGroupItem value="upi" id="rent-upi" />
                          <Label htmlFor="rent-upi" className="flex-1 cursor-pointer flex items-center">
                            <Building2 className="h-4 w-4 mr-2" />
                            UPI
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                          <RadioGroupItem value="netbanking" id="rent-netbanking" />
                          <Label htmlFor="rent-netbanking" className="flex-1 cursor-pointer flex items-center">
                            <Building2 className="h-4 w-4 mr-2" />
                            Net Banking
                          </Label>
                        </div>
                      </RadioGroup>

                      {/* Card Details */}
                      {paymentMethod === "card" && (
                        <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                          <div>
                            <Label htmlFor="rentCardNumber">Card Number *</Label>
                            <Input
                              id="rentCardNumber"
                              required
                              value={paymentData.cardNumber}
                              onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                              placeholder="1234 5678 9012 3456"
                              maxLength={19}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="rentExpiry">Expiry Date *</Label>
                              <Input
                                id="rentExpiry"
                                required
                                value={paymentData.expiry}
                                onChange={(e) => setPaymentData({ ...paymentData, expiry: e.target.value })}
                                placeholder="MM/YY"
                                maxLength={5}
                              />
                            </div>
                            <div>
                              <Label htmlFor="rentCvv">CVV *</Label>
                              <Input
                                id="rentCvv"
                                required
                                value={paymentData.cvv}
                                onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                                placeholder="123"
                                maxLength={3}
                                type="password"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* UPI Details */}
                      {paymentMethod === "upi" && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <Label htmlFor="rentUpiId">UPI ID *</Label>
                          <Input
                            id="rentUpiId"
                            required
                            value={paymentData.upiId}
                            onChange={(e) => setPaymentData({ ...paymentData, upiId: e.target.value })}
                            placeholder="yourname@upi"
                          />
                        </div>
                      )}

                      {/* Net Banking */}
                      {paymentMethod === "netbanking" && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            You will be redirected to your bank's website to complete the payment.
                          </p>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                      <span className="font-semibold">Total Amount:</span>
                      <div className="flex items-center text-2xl font-bold text-blue-600">
                        <IndianRupee className="h-5 w-5" />
                        {residentData?.rentAmount.toLocaleString()}
                      </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full">
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Pay Rent Now
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - AutoPay */}
          <div className="space-y-6">
            {/* AutoPay Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Repeat className="h-5 w-5 mr-2" />
                    AutoPay
                  </CardTitle>
                  <Badge variant={residentData?.autoPayEnabled ? "default" : "secondary"}>
                    {residentData?.autoPayEnabled ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {residentData?.autoPayEnabled ? (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-green-900">AutoPay Enabled</p>
                          <p className="text-sm text-green-700 mt-1">
                            Your rent will be automatically deducted on the 25th of each month.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-semibold">₹{residentData?.rentAmount.toLocaleString()}/month</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Next Deduction:</span>
                        <span className="font-semibold">25th of every month</span>
                      </div>
                    </div>
                    <Button variant="destructive" className="w-full" onClick={handleDisableAutopay}>
                      Disable AutoPay
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">
                      Set up AutoPay to automatically pay your rent every month without missing due dates.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <Clock className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-800">
                          AutoPay will deduct rent on the 25th of each month automatically.
                        </p>
                      </div>
                    </div>
                    <Button className="w-full" onClick={() => setShowAutopaySetup(true)}>
                      Setup AutoPay
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AutoPay Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Never miss a payment deadline",
                    "No late fees or penalties",
                    "Automatic payment every month",
                    "Cancel anytime with one click",
                    "Secure and encrypted transactions"
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AutoPay Setup Modal */}
        {showAutopaySetup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Setup AutoPay</CardTitle>
                <CardDescription>
                  Configure automatic monthly rent payment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSetupAutopay} className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">How AutoPay Works</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Your rent amount of ₹{residentData?.rentAmount.toLocaleString()} will be automatically deducted</li>
                      <li>• Payment occurs on the 25th of every month</li>
                      <li>• You'll receive a confirmation email for each payment</li>
                      <li>• You can disable AutoPay anytime</li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-3 block">Select Payment Method for AutoPay</Label>
                    <RadioGroup value={autopayMethod} onValueChange={(value: any) => setAutopayMethod(value)}>
                      <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="card" id="autopay-card" />
                        <Label htmlFor="autopay-card" className="flex-1 cursor-pointer flex items-center">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Credit / Debit Card
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="upi" id="autopay-upi" />
                        <Label htmlFor="autopay-upi" className="flex-1 cursor-pointer flex items-center">
                          <Building2 className="h-4 w-4 mr-2" />
                          UPI AutoPay
                        </Label>
                      </div>
                    </RadioGroup>

                    {/* Card Details for AutoPay */}
                    {autopayMethod === "card" && (
                      <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <Label htmlFor="autopayCardNumber">Card Number *</Label>
                          <Input
                            id="autopayCardNumber"
                            required
                            value={autopayData.cardNumber}
                            onChange={(e) => setAutopayData({ ...autopayData, cardNumber: e.target.value })}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="autopayExpiry">Expiry Date *</Label>
                            <Input
                              id="autopayExpiry"
                              required
                              value={autopayData.expiry}
                              onChange={(e) => setAutopayData({ ...autopayData, expiry: e.target.value })}
                              placeholder="MM/YY"
                              maxLength={5}
                            />
                          </div>
                          <div>
                            <Label htmlFor="autopayCvv">CVV *</Label>
                            <Input
                              id="autopayCvv"
                              required
                              value={autopayData.cvv}
                              onChange={(e) => setAutopayData({ ...autopayData, cvv: e.target.value })}
                              placeholder="123"
                              maxLength={3}
                              type="password"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* UPI Details for AutoPay */}
                    {autopayMethod === "upi" && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <Label htmlFor="autopayUpiId">UPI ID *</Label>
                        <Input
                          id="autopayUpiId"
                          required
                          value={autopayData.upiId}
                          onChange={(e) => setAutopayData({ ...autopayData, upiId: e.target.value })}
                          placeholder="yourname@upi"
                        />
                        <p className="text-xs text-gray-600 mt-2">
                          You will receive a mandate approval request on your UPI app
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowAutopaySetup(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      Enable AutoPay
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}