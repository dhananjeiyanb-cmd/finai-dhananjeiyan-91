import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/Layout";
import { QrCode, Scan, AlertTriangle, CheckCircle, CreditCard, DollarSign, Camera, Smartphone, Building2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBudget } from "@/contexts/BudgetContext";
import { useToast } from "@/hooks/use-toast";
import QrScanner from 'react-qr-scanner';

const QRPayment = () => {
  const { budgets, processPayment, getCurrentBalance } = useBudget();
  const { toast } = useToast();
  const [step, setStep] = useState<'scan' | 'details' | 'confirm'>('scan');
  const [paymentType, setPaymentType] = useState<'upi' | 'bank'>('upi');
  const [paymentDetails, setPaymentDetails] = useState({
    merchant: "Coffee Bean Cafe",
    amount: 450,
    category: "Food",
    description: "Coffee and snacks"
  });
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    ifscCode: "",
    beneficiaryName: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Get current budget for the selected category
  const currentBudget = budgets.find(b => b.name === paymentDetails.category);
  const remainingBudget = currentBudget ? currentBudget.budget - currentBudget.spent : 0;
  const isOverBudget = currentBudget ? paymentDetails.amount > remainingBudget : false;
  const budgetUsageAfterPayment = currentBudget ? ((currentBudget.spent + paymentDetails.amount) / currentBudget.budget) * 100 : 0;
  
  // Check if user has sufficient balance
  const currentBalance = getCurrentBalance();
  const hasInsufficientBalance = paymentDetails.amount > currentBalance;

  const handleStartScan = () => {
    setIsScanning(true);
    setCameraError(null);
  };

  const handleQRScan = (data: any) => {
    if (data) {
      try {
        // Parse QR code data (assuming it's JSON with payment info)
        const qrData = JSON.parse(data);
        setPaymentDetails(prev => ({
          ...prev,
          merchant: qrData.merchant || prev.merchant,
          amount: qrData.amount || prev.amount,
          description: qrData.description || prev.description
        }));
        setIsScanning(false);
        setStep('details');
        toast({
          title: "QR Code Scanned",
          description: "Payment details loaded successfully!",
        });
      } catch (error) {
        // If QR code is not valid JSON, treat it as merchant name
        setPaymentDetails(prev => ({
          ...prev,
          merchant: data.toString(),
        }));
        setIsScanning(false);
        setStep('details');
        toast({
          title: "QR Code Scanned",
          description: "Merchant information loaded!",
        });
      }
    }
  };

  const handleScanError = (error: any) => {
    console.error('QR Scanner Error:', error);
    setCameraError("Camera access denied or not available. Please allow camera access and try again.");
    setIsScanning(false);
  };

  const handleStopScan = () => {
    setIsScanning(false);
    setCameraError(null);
  };

  const handleConfirmPayment = () => {
    if (hasInsufficientBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance to make this payment.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      processPayment({
        amount: paymentDetails.amount,
        description: paymentDetails.description,
        category: paymentDetails.category,
        merchant: paymentDetails.merchant
      });
      setIsProcessing(false);
      setPaymentComplete(true);
      toast({
        title: "Payment Successful",
        description: `₹${paymentDetails.amount} paid to ${paymentDetails.merchant}`,
      });
    }, 2000);
  };

  const handleNewPayment = () => {
    setStep('scan');
    setPaymentComplete(false);
    setPaymentDetails({
      merchant: "Coffee Bean Cafe",
      amount: 450,
      category: "Food",
      description: "Coffee and snacks"
    });
  };

  if (paymentComplete) {
    return (
      <Layout>
        <div className="max-w-md mx-auto space-y-6">
          <Card className="gradient-card shadow-elevated border-0 text-center">
            <CardContent className="p-8">
              <div className="w-20 h-20 rounded-full bg-success-light flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-card-foreground mb-2">Payment Successful!</h2>
              <p className="text-muted-foreground mb-6">Your payment has been processed successfully</p>
              
              <div className="bg-muted rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Paid to</span>
                  <span className="font-medium text-card-foreground">{paymentDetails.merchant}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-bold text-lg text-card-foreground">₹{paymentDetails.amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Category</span>
                  <span className="text-sm px-2 py-1 rounded-full bg-accent text-accent-foreground">{paymentDetails.category}</span>
                </div>
              </div>
              
              <Button onClick={handleNewPayment} className="w-full gradient-primary">
                Make Another Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">QR Payment</h1>
          <p className="text-muted-foreground">Scan QR code to make secure payments</p>
        </div>

        {/* Payment Method Selection and QR Scan */}
        {step === 'scan' && (
          <Card className="gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle className="text-center text-card-foreground">Choose Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Method Tabs */}
              <Tabs value={paymentType} onValueChange={(value) => setPaymentType(value as 'upi' | 'bank')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upi" className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    UPI Payment
                  </TabsTrigger>
                  <TabsTrigger value="bank" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Bank Transfer
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upi" className="space-y-6 text-center">
              {/* Camera Error Alert */}
              {cameraError && (
                <Alert className="border-destructive bg-destructive/10">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <AlertDescription className="text-destructive">
                    {cameraError}
                  </AlertDescription>
                </Alert>
              )}

              {/* QR Scanner or Placeholder */}
              <div className="w-full h-64 mx-auto bg-muted rounded-2xl overflow-hidden border-2 border-dashed border-border">
                {isScanning ? (
                  <QrScanner
                    delay={300}
                    onError={handleScanError}
                    onScan={handleQRScan}
                    style={{ width: '100%', height: '100%' }}
                    constraints={{
                      video: { facingMode: 'environment' }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {cameraError ? "Camera not available" : "Tap to start camera"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Scanner Controls */}
              {!isScanning ? (
                <Button onClick={handleStartScan} className="w-full gradient-primary shadow-glow">
                  <Camera className="w-4 h-4 mr-2" />
                  Start Camera Scanner
                </Button>
              ) : (
                <Button onClick={handleStopScan} variant="outline" className="w-full">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Stop Scanning
                </Button>
              )}
              
                  <p className="text-xs text-muted-foreground">
                    {isScanning 
                      ? "Position QR code within the camera view" 
                      : "Allow camera access when prompted for QR scanning"
                    }
                  </p>
                </TabsContent>

                <TabsContent value="bank" className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-card-foreground">Bank Transfer Details</h3>
                    <p className="text-sm text-muted-foreground">Enter beneficiary bank details</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="beneficiaryName">Beneficiary Name</Label>
                      <Input
                        id="beneficiaryName"
                        placeholder="Enter recipient name"
                        value={bankDetails.beneficiaryName}
                        onChange={(e) => setBankDetails({ ...bankDetails, beneficiaryName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        placeholder="Enter account number"
                        value={bankDetails.accountNumber}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ifscCode">IFSC Code</Label>
                      <Input
                        id="ifscCode"
                        placeholder="Enter IFSC code"
                        value={bankDetails.ifscCode}
                        onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                      />
                    </div>
                    <Button 
                      onClick={() => setStep('details')} 
                      className="w-full gradient-primary"
                      disabled={!bankDetails.beneficiaryName || !bankDetails.accountNumber || !bankDetails.ifscCode}
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      Continue with Bank Transfer
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Payment Details Step */}
        {step === 'details' && (
          <Card className="gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle className="text-card-foreground">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="merchant">Merchant</Label>
                <Input
                  id="merchant"
                  value={paymentDetails.merchant}
                  readOnly
                  className="bg-muted"
                />
              </div>
              
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={paymentDetails.amount}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, amount: Number(e.target.value) })}
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={paymentDetails.category} onValueChange={(value) => setPaymentDetails({ ...paymentDetails, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                   <SelectContent>
                     {budgets.map(budget => (
                       <SelectItem key={budget.id} value={budget.name}>{budget.name}</SelectItem>
                     ))}
                   </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="What did you buy?"
                  value={paymentDetails.description}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, description: e.target.value })}
                />
              </div>
              
              <Button onClick={() => setStep('confirm')} className="w-full gradient-primary">
                Review Payment
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Confirmation Step */}
        {step === 'confirm' && (
          <div className="space-y-4">
            {/* Insufficient Balance Warning */}
            {hasInsufficientBalance && (
              <Alert className="border-destructive bg-destructive/10">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  ⚠️ Insufficient balance! You need ₹{paymentDetails.amount - currentBalance} more to make this payment.
                </AlertDescription>
              </Alert>
            )}

            {/* Budget Warning */}
            {!hasInsufficientBalance && isOverBudget && currentBudget && (
              <Alert className="border-destructive bg-destructive/10">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  ⚠️ This payment will exceed your {paymentDetails.category} budget by ₹{paymentDetails.amount - remainingBudget}
                </AlertDescription>
              </Alert>
            )}

            {/* Balance Status */}
            <Card className="gradient-card shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-sm text-card-foreground">Balance & Budget Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current balance</span>
                  <span className="text-card-foreground">₹{currentBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">After this payment</span>
                  <span className={hasInsufficientBalance ? 'text-destructive' : 'text-card-foreground'}>
                    ₹{(currentBalance - paymentDetails.amount).toLocaleString()}
                  </span>
                </div>
                {currentBudget && (
                  <>
                    <div className="h-px bg-border my-2"></div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current {paymentDetails.category} spending</span>
                      <span className="text-card-foreground">₹{currentBudget.spent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Budget limit</span>
                      <span className="text-card-foreground">₹{currentBudget.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-muted-foreground">After this payment</span>
                      <span className={budgetUsageAfterPayment > 100 ? 'text-destructive' : 'text-card-foreground'}>
                        ₹{(currentBudget.spent + paymentDetails.amount).toLocaleString()} ({budgetUsageAfterPayment.toFixed(1)}%)
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card className="gradient-card shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-card-foreground">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                  <CreditCard className="w-8 h-8 text-accent-vivid" />
                  <div className="flex-1">
                    <p className="font-medium text-card-foreground">{paymentDetails.merchant}</p>
                    <p className="text-sm text-muted-foreground">{paymentDetails.description}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold text-lg text-card-foreground">₹{paymentDetails.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="text-sm px-2 py-1 rounded-full bg-accent text-accent-foreground">{paymentDetails.category}</span>
                  </div>
                 <div className="flex justify-between">
                   <span className="text-muted-foreground">Payment method</span>
                   <span className="text-card-foreground">{paymentType === 'upi' ? 'UPI' : 'Bank Transfer'}</span>
                 </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <Button 
                    onClick={handleConfirmPayment} 
                    disabled={isProcessing || hasInsufficientBalance}
                    className="w-full gradient-primary shadow-glow"
                  >
                    {isProcessing ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Confirm Payment
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Steps Indicator */}
        <div className="flex justify-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${step === 'scan' ? 'bg-primary' : 'bg-muted'}`}></div>
          <div className={`w-2 h-2 rounded-full ${step === 'details' ? 'bg-primary' : 'bg-muted'}`}></div>
          <div className={`w-2 h-2 rounded-full ${step === 'confirm' ? 'bg-primary' : 'bg-muted'}`}></div>
        </div>
      </div>
    </Layout>
  );
};

export default QRPayment;