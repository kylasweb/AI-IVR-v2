'use client';

import React, { useState, useEffect } from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Star,
  Clock,
  TrendingUp as DollarSign,
  TrendingUp,
  Users,
  Search,
  Filter,
  Plus,
  Eye as Edit,
  Eye,
  MessageSquare,
  Star as Heart,
  Star as Gift,
  Clock as Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Car,
  Clock as History
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: {
    city: string;
    state: string;
    pincode: string;
  };
  status: 'active' | 'inactive' | 'premium' | 'blocked';
  joinDate: string;
  lastRide: string;
  totalRides: number;
  totalSpent: number;
  avgRating: number;
  preferredLanguage: 'malayalam' | 'english' | 'manglish';
  loyaltyPoints: number;
  paymentMethods: string[];
  preferences: {
    vehicleType: string[];
    smokingAllowed: boolean;
    petsAllowed: boolean;
    musicPreference: string;
  };
  rideHistory: {
    date: string;
    from: string;
    to: string;
    fare: number;
    rating: number;
  }[];
  feedback: {
    positive: number;
    negative: number;
    complaints: number;
  };
}

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  premiumCustomers: number;
  avgLifetimeValue: number;
  satisfactionRate: number;
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 'C001',
      name: 'Ravi Kumar',
      phone: '+91 98765 43210',
      email: 'ravi.kumar@gmail.com',
      location: {
        city: 'Kochi',
        state: 'Kerala',
        pincode: '682001'
      },
      status: 'premium',
      joinDate: '2023-01-15',
      lastRide: '2024-01-15T10:30:00Z',
      totalRides: 47,
      totalSpent: 8950,
      avgRating: 4.8,
      preferredLanguage: 'malayalam',
      loyaltyPoints: 245,
      paymentMethods: ['UPI', 'Credit Card'],
      preferences: {
        vehicleType: ['taxi', 'auto'],
        smokingAllowed: false,
        petsAllowed: true,
        musicPreference: 'Malayalam'
      },
      rideHistory: [
        {
          date: '2024-01-15',
          from: 'MG Road',
          to: 'Kakkanad',
          fare: 150,
          rating: 5
        }
      ],
      feedback: {
        positive: 42,
        negative: 3,
        complaints: 1
      }
    },
    {
      id: 'C002',
      name: 'Priya Nair',
      phone: '+91 76543 21098',
      email: 'priya.nair@gmail.com',
      location: {
        city: 'Kottayam',
        state: 'Kerala',
        pincode: '686001'
      },
      status: 'active',
      joinDate: '2023-05-20',
      lastRide: '2024-01-15T11:15:00Z',
      totalRides: 23,
      totalSpent: 4560,
      avgRating: 4.6,
      preferredLanguage: 'english',
      loyaltyPoints: 120,
      paymentMethods: ['UPI', 'Cash'],
      preferences: {
        vehicleType: ['taxi', 'luxury'],
        smokingAllowed: false,
        petsAllowed: false,
        musicPreference: 'English'
      },
      rideHistory: [
        {
          date: '2024-01-15',
          from: 'Railway Station',
          to: 'Kumarakom',
          fare: 450,
          rating: 4
        }
      ],
      feedback: {
        positive: 20,
        negative: 2,
        complaints: 0
      }
    },
    {
      id: 'C003',
      name: 'Mohammed Salim',
      phone: '+91 54321 09876',
      email: 'salim.mohammed@gmail.com',
      location: {
        city: 'Calicut',
        state: 'Kerala',
        pincode: '673001'
      },
      status: 'active',
      joinDate: '2023-08-10',
      lastRide: '2024-01-15T08:00:00Z',
      totalRides: 31,
      totalSpent: 6780,
      avgRating: 4.9,
      preferredLanguage: 'manglish',
      loyaltyPoints: 180,
      paymentMethods: ['UPI'],
      preferences: {
        vehicleType: ['auto', 'bike'],
        smokingAllowed: true,
        petsAllowed: true,
        musicPreference: 'Malayalam'
      },
      rideHistory: [
        {
          date: '2024-01-15',
          from: 'Calicut Beach',
          to: 'Wayanad',
          fare: 850,
          rating: 5
        }
      ],
      feedback: {
        positive: 29,
        negative: 1,
        complaints: 0
      }
    }
  ]);

  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: 2847,
    activeCustomers: 1923,
    newCustomers: 156,
    premiumCustomers: 234,
    avgLifetimeValue: 5670,
    satisfactionRate: 4.7
  });

  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <Clock className="h-4 w-4" />;
      case 'premium': return <Star className="h-4 w-4" />;
      case 'blocked': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getLanguageFlag = (language: string) => {
    switch (language) {
      case 'malayalam': return '🇮🇳 മലയാളം';
      case 'english': return '🇺🇸 English';
      case 'manglish': return '🔄 Manglish';
      default: return '🌐 Mixed';
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || customer.location.city.toLowerCase() === locationFilter;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const handleCallCustomer = (phone: string) => {
    console.log('Calling customer:', phone);
    // Integrate with AI IVR system
  };

  const handleSendMessage = (phone: string) => {
    console.log('Sending message to customer:', phone);
    // Integrate with messaging system
  };

  const renderCustomerCard = (customer: Customer) => (
    <Card key={customer.id} className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`/avatars/${customer.id}.jpg`} />
              <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{customer.name}</h3>
              <p className="text-sm text-gray-600">{customer.phone}</p>
              <p className="text-sm text-gray-600">{customer.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="font-medium">{customer.avgRating}</span>
                <span className="text-sm text-gray-600">({customer.totalRides} rides)</span>
                <span className="text-xs">{getLanguageFlag(customer.preferredLanguage)}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge className={getStatusColor(customer.status)} variant="secondary">
              {getStatusIcon(customer.status)}
              <span className="ml-1 capitalize">{customer.status}</span>
            </Badge>
            <p className="text-sm text-gray-600 mt-1">ID: {customer.id}</p>
            {customer.loyaltyPoints > 0 && (
              <Badge variant="outline" className="mt-1">
                <Gift className="h-3 w-3 mr-1" />
                {customer.loyaltyPoints} points
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Location & Contact */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Contact & Location</h4>
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-600" />
                <span className="text-sm">{customer.location.city}, {customer.location.state}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-600" />
                <span className="text-sm">{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-green-600" />
                <span className="text-xs text-gray-600">{customer.email}</span>
              </div>
              <p className="text-xs text-gray-500">
                Joined: {new Date(customer.joinDate).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>

          {/* Ride Stats */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Ride Statistics</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Rides:</span>
                <span className="font-medium">{customer.totalRides}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Spent:</span>
                <span className="font-medium">₹{customer.totalSpent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg per Ride:</span>
                <span className="font-medium">₹{Math.round(customer.totalSpent / customer.totalRides)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Ride:</span>
                <span className="font-medium text-xs">
                  {new Date(customer.lastRide).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Preferences & Feedback */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Preferences</h4>
            <div className="space-y-2 mb-3">
              <div className="flex flex-wrap gap-1">
                {customer.preferences.vehicleType.map((type, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    <Car className="h-3 w-3 mr-1" />
                    {type}
                  </Badge>
                ))}
              </div>
              <div className="text-xs text-gray-600">
                Payment: {customer.paymentMethods.join(', ')}
              </div>
            </div>

            <h5 className="font-medium text-gray-900 mb-1 text-sm">Feedback Score</h5>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Positive: {customer.feedback.positive}</span>
                <span className="text-red-600">Negative: {customer.feedback.negative}</span>
              </div>
              {customer.feedback.complaints > 0 && (
                <div className="text-xs text-orange-600">
                  Complaints: {customer.feedback.complaints}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Ride */}
        {customer.rideHistory.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2">Recent Ride</h4>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">
                    {customer.rideHistory[0].from} → {customer.rideHistory[0].to}
                  </p>
                  <p className="text-xs text-gray-600">{customer.rideHistory[0].date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{customer.rideHistory[0].fare}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="text-xs">{customer.rideHistory[0].rating}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCallCustomer(customer.phone)}
          >
            <Phone className="h-3 w-3 mr-1" />
            Call
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSendMessage(customer.phone)}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Message
          </Button>
          <Button variant="outline" size="sm">
            <History className="h-3 w-3 mr-1" />
            Ride History
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="h-3 w-3 mr-1" />
            View Profile
          </Button>
          <Button variant="outline" size="sm">
            <Gift className="h-3 w-3 mr-1" />
            Rewards
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ManagementLayout
      title="Customer Management"
      subtitle="Manage customers, loyalty programs, and personalized experiences"
    >
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button variant="outline">
            <Gift className="h-4 w-4 mr-2" />
            Loyalty Program
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Customers</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalCustomers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Active Customers</p>
                  <p className="text-2xl font-bold text-green-900">{stats.activeCustomers.toLocaleString()}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Premium Members</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.premiumCustomers}</p>
                </div>
                <Star className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">New This Month</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.newCustomers}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-700">Avg LTV</p>
                  <p className="text-2xl font-bold text-indigo-900">₹{(stats.avgLifetimeValue / 1000).toFixed(1)}K</p>
                </div>
                <DollarSign className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-pink-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-pink-700">Satisfaction</p>
                  <p className="text-2xl font-bold text-pink-900">{stats.satisfactionRate}</p>
                </div>
                <Heart className="h-8 w-8 text-pink-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, phone, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="kochi">Kochi</SelectItem>
                  <SelectItem value="kottayam">Kottayam</SelectItem>
                  <SelectItem value="calicut">Calicut</SelectItem>
                  <SelectItem value="trivandrum">Trivandrum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Customers List */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Customers ({customers.length})</TabsTrigger>
            <TabsTrigger value="premium">Premium ({customers.filter(c => c.status === 'premium').length})</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="loyalty">Loyalty Program</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-4">
              {filteredCustomers.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No customers found matching your criteria.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredCustomers.map(renderCustomerCard)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ManagementLayout>
  );
}