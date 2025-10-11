'use client';

import React, { useState, useEffect } from 'react';
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
  Car, 
  MapPin, 
  Phone, 
  Star, 
  Clock,
  TrendingUp as DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Plus,
  Eye as Edit,
  Eye,
  MessageSquare,
  Navigation,
  Shield,
  Clock as Calendar,
  Star as Award,
  Activity
} from 'lucide-react';

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  vehicleType: 'auto' | 'taxi' | 'bike' | 'luxury';
  vehicleNumber: string;
  status: 'online' | 'offline' | 'busy' | 'suspended';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  rating: number;
  totalRides: number;
  earnings: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  documents: {
    license: 'verified' | 'pending' | 'rejected';
    registration: 'verified' | 'pending' | 'rejected';
    insurance: 'verified' | 'pending' | 'rejected';
    permit: 'verified' | 'pending' | 'rejected';
  };
  performance: {
    acceptanceRate: number;
    completionRate: number;
    customerRating: number;
    onTimePerformance: number;
  };
  joinDate: string;
  lastActive: string;
}

interface DriverStats {
  totalDrivers: number;
  onlineDrivers: number;
  busyDrivers: number;
  avgRating: number;
  totalEarnings: number;
  newApplications: number;
}

export default function DriverManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([
    {
      id: 'D001',
      name: 'Suresh Babu',
      phone: '+91 87654 32109',
      email: 'suresh.babu@gmail.com',
      licenseNumber: 'KL-07-20240001',
      vehicleType: 'auto',
      vehicleNumber: 'KL-07-AB-1234',
      status: 'online',
      location: {
        lat: 9.9312,
        lng: 76.2673,
        address: 'MG Road, Kochi'
      },
      rating: 4.8,
      totalRides: 247,
      earnings: {
        today: 850,
        thisWeek: 4200,
        thisMonth: 18500
      },
      documents: {
        license: 'verified',
        registration: 'verified',
        insurance: 'verified',
        permit: 'verified'
      },
      performance: {
        acceptanceRate: 92,
        completionRate: 98,
        customerRating: 4.8,
        onTimePerformance: 95
      },
      joinDate: '2023-06-15',
      lastActive: '2024-01-15T12:30:00Z'
    },
    {
      id: 'D002',
      name: 'Anil Krishnan',
      phone: '+91 65432 10987',
      email: 'anil.krishnan@gmail.com',
      licenseNumber: 'KL-14-20240002',
      vehicleType: 'taxi',
      vehicleNumber: 'KL-14-CD-5678',
      status: 'busy',
      location: {
        lat: 9.5916,
        lng: 76.5222,
        address: 'Kottayam Railway Station'
      },
      rating: 4.6,
      totalRides: 189,
      earnings: {
        today: 1200,
        thisWeek: 5800,
        thisMonth: 22300
      },
      documents: {
        license: 'verified',
        registration: 'verified',
        insurance: 'pending',
        permit: 'verified'
      },
      performance: {
        acceptanceRate: 87,
        completionRate: 95,
        customerRating: 4.6,
        onTimePerformance: 88
      },
      joinDate: '2023-08-22',
      lastActive: '2024-01-15T12:45:00Z'
    },
    {
      id: 'D003',
      name: 'Rajesh P',
      phone: '+91 43210 98765',
      email: 'rajesh.p@gmail.com',
      licenseNumber: 'KL-11-20240003',
      vehicleType: 'luxury',
      vehicleNumber: 'KL-11-EF-9012',
      status: 'offline',
      location: {
        lat: 11.2588,
        lng: 75.7804,
        address: 'Calicut Beach Road'
      },
      rating: 4.9,
      totalRides: 156,
      earnings: {
        today: 0,
        thisWeek: 3200,
        thisMonth: 15600
      },
      documents: {
        license: 'verified',
        registration: 'verified',
        insurance: 'verified',
        permit: 'verified'
      },
      performance: {
        acceptanceRate: 95,
        completionRate: 99,
        customerRating: 4.9,
        onTimePerformance: 97
      },
      joinDate: '2023-09-10',
      lastActive: '2024-01-15T08:15:00Z'
    }
  ]);

  const [stats, setStats] = useState<DriverStats>({
    totalDrivers: 124,
    onlineDrivers: 45,
    busyDrivers: 23,
    avgRating: 4.7,
    totalEarnings: 125000,
    newApplications: 12
  });

  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4" />;
      case 'offline': return <XCircle className="h-4 w-4" />;
      case 'busy': return <Clock className="h-4 w-4" />;
      case 'suspended': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getDocumentStatus = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.phone.includes(searchTerm) ||
                         driver.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    const matchesVehicle = vehicleFilter === 'all' || driver.vehicleType === vehicleFilter;
    return matchesSearch && matchesStatus && matchesVehicle;
  });

  const handleCallDriver = (phone: string) => {
    console.log('Calling driver:', phone);
    // Integrate with AI IVR system
  };

  const handleSendMessage = (phone: string) => {
    console.log('Sending message to driver:', phone);
    // Integrate with messaging system
  };

  const renderDriverCard = (driver: Driver) => (
    <Card key={driver.id} className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`/avatars/${driver.id}.jpg`} />
              <AvatarFallback>{driver.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{driver.name}</h3>
              <p className="text-sm text-gray-600">{driver.phone}</p>
              <div className="flex items-center gap-2 mt-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="font-medium">{driver.rating}</span>
                <span className="text-sm text-gray-600">({driver.totalRides} rides)</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge className={getStatusColor(driver.status)} variant="secondary">
              {getStatusIcon(driver.status)}
              <span className="ml-1 capitalize">{driver.status}</span>
            </Badge>
            <p className="text-sm text-gray-600 mt-1">ID: {driver.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Vehicle Info */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Vehicle Details</h4>
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-gray-600" />
                <span className="text-sm capitalize">{driver.vehicleType}</span>
              </div>
              <p className="text-sm font-medium">{driver.vehicleNumber}</p>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-gray-600">{driver.location.address}</span>
              </div>
            </div>
          </div>

          {/* Earnings */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Earnings</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Today:</span>
                <span className="font-medium">₹{driver.earnings.today}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">This Week:</span>
                <span className="font-medium">₹{driver.earnings.thisWeek}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">This Month:</span>
                <span className="font-medium">₹{driver.earnings.thisMonth}</span>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Performance</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Acceptance Rate</span>
                  <span>{driver.performance.acceptanceRate}%</span>
                </div>
                <Progress value={driver.performance.acceptanceRate} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Completion Rate</span>
                  <span>{driver.performance.completionRate}%</span>
                </div>
                <Progress value={driver.performance.completionRate} className="h-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Documents Status */}
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium text-gray-900 mb-2">Document Verification</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(driver.documents).map(([doc, status]) => (
              <div key={doc} className="flex items-center gap-2">
                {getDocumentStatus(status)}
                <span className="text-sm capitalize">{doc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleCallDriver(driver.phone)}
          >
            <Phone className="h-3 w-3 mr-1" />
            Call
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleSendMessage(driver.phone)}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Message
          </Button>
          <Button variant="outline" size="sm">
            <Navigation className="h-3 w-3 mr-1" />
            Track
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="h-3 w-3 mr-1" />
            View Profile
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-gray-600">Manage drivers, vehicles, and performance with AI-powered insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            Verify Documents
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Driver
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Drivers</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalDrivers}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Online Now</p>
                <p className="text-2xl font-bold text-green-900">{stats.onlineDrivers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Currently Busy</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.busyDrivers}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Avg Rating</p>
                <p className="text-2xl font-bold text-purple-900">{stats.avgRating}</p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-700">Total Earnings</p>
                <p className="text-2xl font-bold text-indigo-900">₹{(stats.totalEarnings/1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">New Applications</p>
                <p className="text-2xl font-bold text-orange-900">{stats.newApplications}</p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
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
                  placeholder="Search by name, phone, or vehicle number..."
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
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by vehicle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="taxi">Taxi</SelectItem>
                <SelectItem value="bike">Bike</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Drivers List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active Drivers ({drivers.filter(d => ['online', 'busy'].includes(d.status)).length})</TabsTrigger>
          <TabsTrigger value="offline">Offline</TabsTrigger>
          <TabsTrigger value="applications">New Applications</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="all">All Drivers</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4">
            {filteredDrivers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No drivers found matching your criteria.</p>
                </CardContent>
              </Card>
            ) : (
              filteredDrivers.map(renderDriverCard)
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}