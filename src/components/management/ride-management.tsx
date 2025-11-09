'use client';

import React, { useState, useEffect } from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MapPin,
  Car,
  Clock,
  Users,
  TrendingUp,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Phone,
  MessageSquare,
  Navigation,
  TrendingUp as DollarSign,
  Star,
  Clock as Calendar,
  BarChart3
} from 'lucide-react';

interface Ride {
  id: string;
  customerName: string;
  customerPhone: string;
  driverName: string;
  driverPhone: string;
  pickup: string;
  destination: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  fare: number;
  distance: number;
  duration: number;
  rating?: number;
  createdAt: string;
  vehicleType: 'auto' | 'taxi' | 'bike' | 'luxury';
}

interface RideStats {
  totalRides: number;
  activeRides: number;
  completedToday: number;
  revenue: number;
  avgRating: number;
  availableDrivers: number;
}

export default function RideManagement() {
  const [rides, setRides] = useState<Ride[]>([
    {
      id: 'R001',
      customerName: 'Ravi Kumar',
      customerPhone: '+91 98765 43210',
      driverName: 'Suresh Babu',
      driverPhone: '+91 87654 32109',
      pickup: 'MG Road, Kochi',
      destination: 'Kakkanad, Kochi',
      status: 'in_progress',
      fare: 150,
      distance: 8.5,
      duration: 25,
      createdAt: '2024-01-15T10:30:00Z',
      vehicleType: 'auto'
    },
    {
      id: 'R002',
      customerName: 'Priya Nair',
      customerPhone: '+91 76543 21098',
      driverName: 'Anil Krishnan',
      driverPhone: '+91 65432 10987',
      pickup: 'Kottayam Railway Station',
      destination: 'Kumarakom Resort',
      status: 'assigned',
      fare: 450,
      distance: 15.2,
      duration: 35,
      createdAt: '2024-01-15T11:15:00Z',
      vehicleType: 'taxi'
    },
    {
      id: 'R003',
      customerName: 'Mohammed Salim',
      customerPhone: '+91 54321 09876',
      driverName: 'Rajesh P',
      driverPhone: '+91 43210 98765',
      pickup: 'Calicut Beach',
      destination: 'Wayanad',
      status: 'completed',
      fare: 850,
      distance: 45.8,
      duration: 90,
      rating: 4.8,
      createdAt: '2024-01-15T08:00:00Z',
      vehicleType: 'luxury'
    }
  ]);

  const [stats, setStats] = useState<RideStats>({
    totalRides: 1247,
    activeRides: 23,
    completedToday: 156,
    revenue: 45670,
    avgRating: 4.6,
    availableDrivers: 42
  });

  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'assigned': return <Users className="h-4 w-4" />;
      case 'in_progress': return <Car className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredRides = rides.filter(ride => {
    const matchesSearch = ride.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ride.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCallCustomer = (phone: string) => {
    console.log('Calling customer:', phone);
    // Integrate with AI IVR system
  };

  const handleCallDriver = (phone: string) => {
    console.log('Calling driver:', phone);
    // Integrate with AI IVR system
  };

  const renderRideCard = (ride: Ride) => (
    <Card key={ride.id} className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Car className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-lg">Ride #{ride.id}</p>
              <p className="text-sm text-gray-600">
                {new Date(ride.createdAt).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(ride.status)} variant="secondary">
            {getStatusIcon(ride.status)}
            <span className="ml-1 capitalize">{ride.status.replace('_', ' ')}</span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer & Driver Info */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Customer</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium">{ride.customerName}</p>
                <p className="text-sm text-gray-600">{ride.customerPhone}</p>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCallCustomer(ride.customerPhone)}
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Call
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    SMS
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Driver</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium">{ride.driverName}</p>
                <p className="text-sm text-gray-600">{ride.driverPhone}</p>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCallDriver(ride.driverPhone)}
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Call
                  </Button>
                  <Button size="sm" variant="outline">
                    <Navigation className="h-3 w-3 mr-1" />
                    Track
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Trip Details</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Pickup</p>
                    <p className="text-sm text-gray-600">{ride.pickup}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Destination</p>
                    <p className="text-sm text-gray-600">{ride.destination}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">₹{ride.fare}</p>
                <p className="text-sm text-blue-700">Fare</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{ride.distance}km</p>
                <p className="text-sm text-green-700">Distance</p>
              </div>
            </div>

            {ride.rating && (
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="font-medium">{ride.rating}</span>
                <span className="text-sm text-gray-600">Customer Rating</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" size="sm">
            View Details
          </Button>
          {ride.status === 'pending' && (
            <Button size="sm">Assign Driver</Button>
          )}
          {ride.status === 'in_progress' && (
            <Button size="sm" variant="outline">
              <Navigation className="h-3 w-3 mr-1" />
              Track Live
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ManagementLayout
      title="Ride Management"
      subtitle="Manage rides, drivers, and customer interactions through AI IVR"
    >
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Car className="h-4 w-4 mr-2" />
            New Ride
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Rides</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalRides}</p>
                </div>
                <Car className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Active Rides</p>
                  <p className="text-2xl font-bold text-green-900">{stats.activeRides}</p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Today's Rides</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.completedToday}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">Revenue</p>
                  <p className="text-2xl font-bold text-yellow-900">₹{(stats.revenue / 1000).toFixed(0)}K</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Avg Rating</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.avgRating}</p>
                </div>
                <Star className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-700">Drivers</p>
                  <p className="text-2xl font-bold text-indigo-900">{stats.availableDrivers}</p>
                </div>
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by customer, driver, or ride ID..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rides List */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="active">Active Rides ({rides.filter(r => ['pending', 'assigned', 'in_progress'].includes(r.status)).length})</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            <TabsTrigger value="all">All Rides</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-4">
              {filteredRides.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No rides found matching your criteria.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredRides.map(renderRideCard)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ManagementLayout>
  );
}