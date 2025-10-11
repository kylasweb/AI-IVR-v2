"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MapPin, 
  Clock, 
  Phone, 
  Star, 
  Car, 
  User, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Navigation
} from "lucide-react";

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNo: string;
  isAvailable: boolean;
  currentLat?: number;
  currentLng?: number;
  rating: number;
  totalRides: number;
}

interface Ride {
  id: string;
  riderId: string;
  driverId?: string;
  pickupLocation: string;
  pickupLat: number;
  pickupLng: number;
  dropLocation: string;
  dropLat: number;
  dropLng: number;
  vehicleType: string;
  fare: number;
  status: string;
  paymentStatus: string;
  scheduledFor?: string;
  createdAt: string;
  rider: {
    name: string;
    phone: string;
  };
  driver?: {
    name: string;
    phone: string;
    vehicleType: string;
    vehicleNo: string;
  };
}

export default function DispatcherDashboard() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [ridesResponse, driversResponse] = await Promise.all([
        fetch('/api/rides'),
        fetch('/api/drivers?available=true')
      ]);

      const ridesData = await ridesResponse.json();
      const driversData = await driversResponse.json();

      setRides(ridesData.rides || []);
      setDrivers(driversData.drivers || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const matchDriver = async (rideId: string, driverId: string) => {
    try {
      const response = await fetch(`/api/rides/${rideId}/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driverId }),
      });

      if (response.ok) {
        fetchData();
        setSelectedRide(null);
      }
    } catch (error) {
      console.error('Error matching driver:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'accepted': return <Clock className="h-4 w-4" />;
      case 'ongoing': return <Navigation className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType.toLowerCase()) {
      case 'auto': return '🛺';
      case 'car': return '🚗';
      case 'bike': return '🏍️';
      case 'scooter': return '🛵';
      default: return '🚗';
    }
  };

  const availableDrivers = drivers.filter(d => d.isAvailable);
  const pendingRides = rides.filter(r => r.status === 'pending');
  const activeRides = rides.filter(r => ['accepted', 'ongoing'].includes(r.status));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Rides</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingRides.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rides</CardTitle>
            <Navigation className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeRides.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Drivers</CardTitle>
            <Car className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableDrivers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <User className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{drivers.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Rides ({pendingRides.length})</TabsTrigger>
          <TabsTrigger value="active">Active Rides ({activeRides.length})</TabsTrigger>
          <TabsTrigger value="drivers">Available Drivers ({availableDrivers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pending Rides List */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Ride Requests</CardTitle>
                <CardDescription>Rides waiting for driver assignment</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {pendingRides.map((ride) => (
                      <div
                        key={ride.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedRide?.id === ride.id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedRide(ride)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{getVehicleIcon(ride.vehicleType)}</span>
                              <Badge className={getStatusColor(ride.status)}>
                                {getStatusIcon(ride.status)}
                                <span className="ml-1">{ride.status}</span>
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-green-600" />
                                <span className="font-medium">Pickup:</span>
                                <span className="text-gray-600">{ride.pickupLocation}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-red-600" />
                                <span className="font-medium">Drop:</span>
                                <span className="text-gray-600">{ride.dropLocation}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{ride.rider.name}</span>
                                <Phone className="h-3 w-3 ml-2" />
                                <span>{ride.rider.phone}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Fare:</span>
                                <span className="text-green-600">₹{ride.fare}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {pendingRides.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No pending rides
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Driver Matching */}
            <Card>
              <CardHeader>
                <CardTitle>Match Driver</CardTitle>
                <CardDescription>
                  {selectedRide ? `Assign driver for ride to ${selectedRide.dropLocation}` : 'Select a ride to assign driver'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedRide ? (
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {availableDrivers
                        .filter(driver => driver.vehicleType === selectedRide.vehicleType)
                        .map((driver) => (
                          <div key={driver.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{driver.name}</div>
                                  <div className="text-sm text-gray-500">{driver.vehicleNo}</div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3 text-yellow-500" />
                                      <span>{driver.rating.toFixed(1)}</span>
                                    </div>
                                    <span>•</span>
                                    <span>{driver.totalRides} rides</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getVehicleIcon(driver.vehicleType)}</span>
                                <Button
                                  size="sm"
                                  onClick={() => matchDriver(selectedRide.id, driver.id)}
                                >
                                  Assign
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      {availableDrivers.filter(d => d.vehicleType === selectedRide.vehicleType).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No available drivers for {selectedRide.vehicleType}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex items-center justify-center h-96 text-gray-500">
                    Select a ride to assign driver
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Rides</CardTitle>
              <CardDescription>Rides currently in progress</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {activeRides.map((ride) => (
                    <div key={ride.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{getVehicleIcon(ride.vehicleType)}</span>
                            <Badge className={getStatusColor(ride.status)}>
                              {getStatusIcon(ride.status)}
                              <span className="ml-1">{ride.status}</span>
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span className="font-medium">Rider:</span>
                                <span>{ride.rider.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{ride.rider.phone}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-green-600" />
                                <span className="font-medium">From:</span>
                                <span className="text-gray-600">{ride.pickupLocation}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              {ride.driver && (
                                <>
                                  <div className="flex items-center gap-1">
                                    <Car className="h-3 w-3" />
                                    <span className="font-medium">Driver:</span>
                                    <span>{ride.driver.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-gray-600">{ride.driver.vehicleNo}</span>
                                  </div>
                                </>
                              )}
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-red-600" />
                                <span className="font-medium">To:</span>
                                <span className="text-gray-600">{ride.dropLocation}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="font-medium">Fare:</span>
                            <span className="text-green-600">₹{ride.fare}</span>
                            <Separator orientation="vertical" className="h-4" />
                            <span className="font-medium">Payment:</span>
                            <Badge variant={ride.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                              {ride.paymentStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {activeRides.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No active rides
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Drivers</CardTitle>
              <CardDescription>Drivers currently available for rides</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {availableDrivers.map((driver) => (
                    <div key={driver.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{driver.name}</div>
                            <div className="text-sm text-gray-500">{driver.vehicleNo}</div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span>{driver.rating.toFixed(1)}</span>
                              </div>
                              <span>•</span>
                              <span>{driver.totalRides} rides</span>
                              <span>•</span>
                              <span className="text-lg">{getVehicleIcon(driver.vehicleType)}</span>
                              <span className="capitalize">{driver.vehicleType}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{driver.phone}</span>
                          <Badge className="bg-green-100 text-green-800">
                            Available
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  {availableDrivers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No available drivers
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}