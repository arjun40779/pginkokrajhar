'use client';
import { useState } from 'react';
import { rooms } from '../data/roomsData';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/Card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Separator } from '../ui/separator';
import {
  IndianRupee,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { redirect, useParams } from 'next/navigation';

export function Payment() {
  const { roomId } = useParams();

  const room = rooms.find((r) => r.id === roomId);

  const [paymentType, setPaymentType] = useState<'monthly' | 'onetime'>(
    'monthly',
  );
  const [paymentMethod, setPaymentMethod] = useState<
    'card' | 'upi' | 'netbanking'
  >('card');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    upiId: '',
  });

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Room Not Found
          </h2>
          <Button onClick={() => redirect('/rooms')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Rooms
          </Button>
        </div>
      </div>
    );
  }

  const calculateTotal = () => {
    if (paymentType === 'monthly') {
      return room.price;
    }
    // One-time payment (3 months) with 5% discount
    return Math.round(room.price * 3 * 0.95);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would process payment through a payment gateway
    toast.success('Payment processed successfully! Booking confirmed.');
    setTimeout(() => {
      redirect('/rooms');
    }, 2000);
  };

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => redirect('/rooms')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Rooms
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                  Complete your booking by providing payment information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Personal Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="john@example.com"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Type */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Payment Type</h3>
                    <RadioGroup
                      value={paymentType}
                      onValueChange={(value: any) => setPaymentType(value)}
                    >
                      <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="monthly" id="monthly" />
                        <Label
                          htmlFor="monthly"
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold">
                                Monthly Payment
                              </div>
                              <div className="text-sm text-gray-600">
                                Pay every month
                              </div>
                            </div>
                            <div className="flex items-center text-lg font-bold">
                              <IndianRupee className="h-4 w-4" />
                              {room.price.toLocaleString()}/mo
                            </div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="onetime" id="onetime" />
                        <Label
                          htmlFor="onetime"
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold">
                                One-Time Payment (3 Months)
                                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                  Save 5%
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                Pay for 3 months upfront
                              </div>
                            </div>
                            <div className="flex items-center text-lg font-bold">
                              <IndianRupee className="h-4 w-4" />
                              {Math.round(
                                room.price * 3 * 0.95,
                              ).toLocaleString()}
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  {/* Payment Method */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Payment Method
                    </h3>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(value: any) => setPaymentMethod(value)}
                    >
                      <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="card" id="card" />
                        <Label
                          htmlFor="card"
                          className="flex-1 cursor-pointer flex items-center"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Credit / Debit Card
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="upi" id="upi" />
                        <Label
                          htmlFor="upi"
                          className="flex-1 cursor-pointer flex items-center"
                        >
                          <Building2 className="h-4 w-4 mr-2" />
                          UPI
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="netbanking" id="netbanking" />
                        <Label
                          htmlFor="netbanking"
                          className="flex-1 cursor-pointer flex items-center"
                        >
                          <Building2 className="h-4 w-4 mr-2" />
                          Net Banking
                        </Label>
                      </div>
                    </RadioGroup>

                    {/* Card Details */}
                    {paymentMethod === 'card' && (
                      <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <Label htmlFor="cardNumber">Card Number *</Label>
                          <Input
                            id="cardNumber"
                            required
                            value={formData.cardNumber}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                cardNumber: e.target.value,
                              })
                            }
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiry">Expiry Date *</Label>
                            <Input
                              id="expiry"
                              required
                              value={formData.expiry}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  expiry: e.target.value,
                                })
                              }
                              placeholder="MM/YY"
                              maxLength={5}
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV *</Label>
                            <Input
                              id="cvv"
                              required
                              value={formData.cvv}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  cvv: e.target.value,
                                })
                              }
                              placeholder="123"
                              maxLength={3}
                              type="password"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* UPI Details */}
                    {paymentMethod === 'upi' && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <Label htmlFor="upiId">UPI ID *</Label>
                        <Input
                          id="upiId"
                          required
                          value={formData.upiId}
                          onChange={(e) =>
                            setFormData({ ...formData, upiId: e.target.value })
                          }
                          placeholder="yourname@upi"
                        />
                      </div>
                    )}

                    {/* Net Banking */}
                    {paymentMethod === 'netbanking' && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          You will be redirected to your bank's website to
                          complete the payment.
                        </p>
                      </div>
                    )}
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Complete Payment
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-lg">{room.name}</h3>
                  <p className="text-sm text-gray-600">{room.type} Sharing</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Room Type:</span>
                    <span className="font-semibold">{room.type} Sharing</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Type:</span>
                    <span className="font-semibold capitalize">
                      {paymentType === 'monthly' ? 'Monthly' : '3 Months'}
                    </span>
                  </div>
                  {paymentType === 'onetime' && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount (5%):</span>
                      <span>
                        - ₹{Math.round(room.price * 3 * 0.05).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount:</span>
                  <div className="flex items-center text-2xl font-bold text-blue-600">
                    <IndianRupee className="h-5 w-5" />
                    {calculateTotal().toLocaleString()}
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-700">
                    <strong>Included:</strong> 3 meals/day, WiFi, housekeeping,
                    laundry, power backup, and all amenities
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

