"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Coins, ArrowLeft } from "lucide-react";
import Link from "next/link";

const coinPackages = [
  {
    id: "starter",
    name: "Starter Pack",
    coins: 50,
    price: 499,
    popular: false,
    features: ["50 Coins", "Access to paid projects", "Basic support"]
  },
  {
    id: "pro",
    name: "Pro Pack",
    coins: 150,
    price: 999,
    popular: true,
    features: ["150 Coins", "Access to all projects", "Priority support", "20% bonus coins"]
  },
  {
    id: "premium",
    name: "Premium Pack",
    coins: 500,
    price: 2999,
    popular: false,
    features: ["500 Coins", "Unlimited access", "Premium support", "50% bonus coins"]
  }
];

export default function UpgradePage() {
  const handlePurchase = (packageId: string) => {
    window.location.href = `/upgrade/${packageId}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </Button>
        
        <h1 className="text-4xl font-bold mb-4">Upgrade Your Account</h1>
        <p className="text-muted-foreground text-lg">
          Get more coins to access premium projects and features
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coinPackages.map((pkg) => (
          <Card key={pkg.id} className={`relative ${pkg.popular ? "ring-2 ring-primary" : ""}`}>
            {pkg.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{pkg.name}</CardTitle>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Coins className="h-6 w-6 text-yellow-500" />
                <span className="text-3xl font-bold">{pkg.coins}</span>
                <span className="text-muted-foreground">coins</span>
              </div>
              <div className="text-2xl font-bold mt-2">
                ₹{pkg.price}
              </div>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3 mb-6">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full" 
                variant={pkg.popular ? "default" : "outline"}
                onClick={() => handlePurchase(pkg.id)}
              >
                Purchase Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">How Coins Work</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <strong>Paid Projects:</strong> Usually cost 10-50 coins
              </div>
              <div>
                <strong>Premium Projects:</strong> Usually cost 50-100 coins
              </div>
              <div>
                <strong>Free Projects:</strong> Always free to access
              </div>
              <div>
                <strong>Secure:</strong> Coins are stored securely on our servers
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}