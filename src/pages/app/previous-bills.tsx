import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, Calendar, Building, User, IndianRupee, Search,
  Eye, Trash2, Loader2, ArrowRight, Receipt, Activity, ShieldCheck
} from "lucide-react";
import { billService, BillRecord } from "@/services/billService";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useProfile } from "@/contexts/ProfileContext";
import { toast } from "sonner";

const PreviousBills = () => {
  const { user } = useSupabaseAuth();
  const { activeProfile } = useProfile();
  const navigate = useNavigate();
  const [bills, setBills] = useState<BillRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadBills();
    }
  }, [user, activeProfile.id]);

  const loadBills = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await billService.getUserBills(user.id, 50, 0, activeProfile.id);
      if (error) {
        toast.error("Failed to load bills: " + error);
      } else if (data) {
        setBills(data);
      }
    } catch (error) {
      toast.error("Error loading bills");
    } finally {
      setLoading(false);
    }
  };

  const handleViewBill = (bill: BillRecord) => {
    navigate("/app/bill-explainer", { 
      state: { 
        billData: bill,
        isViewMode: true 
      } 
    });
  };

  const handleDeleteBill = async (billId: string) => {
    setDeletingId(billId);
    try {
      const { error } = await billService.deleteBill(billId);
      if (error) {
        toast.error("Failed to delete bill: " + error);
      } else {
        toast.success("Bill deleted successfully");
        setBills(bills.filter(bill => bill.id !== billId));
      }
    } catch (error) {
      toast.error("Error deleting bill");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredBills = bills.filter(bill => {
    const searchLower = searchTerm.toLowerCase();
    const structuredData = bill.structured_data;
    
    return (
      bill.raw_text.toLowerCase().includes(searchLower) ||
      (structuredData.patientName?.toLowerCase().includes(searchLower) || false) ||
      (structuredData.hospitalName?.toLowerCase().includes(searchLower) || false) ||
      (structuredData.lineItems?.some(item => 
        item.item.toLowerCase().includes(searchLower)
      ) || false)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20">
      {/* Immersive Background Layer */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.04] blur-[80px] scale-125 animate-drift will-change-transform"
          style={{ 
            backgroundImage: "url('/dashboard-bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-mesh opacity-10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Clinical Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 py-8 animate-slide-up">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] text-amber-500 uppercase mb-2">
              <Receipt className="h-3 w-3 fill-amber-500" />
              Bill History
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Ledger <span className="text-amber-500">History</span>
            </h1>
            <p className="text-muted-foreground text-sm font-medium max-w-lg">
              Historical record of all clinical transcriptions and insurance reconciliations for <strong className="text-foreground">{activeProfile.name}</strong>.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter by hospital, patient, or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 rounded-full bg-white/5 border-white/10 h-10 text-xs font-medium focus:ring-amber-500/20"
            />
          </div>
        </div>

        {/* Bills Feed */}
        {filteredBills.length === 0 ? (
          <div className="py-32 text-center animate-slide-up" style={{ animationDelay: '100ms' }}>
             <div className="floating-blob w-20 h-20 mx-auto flex items-center justify-center mb-6 border-amber-500/20">
                <FileText className="h-8 w-8 text-amber-500/40" />
             </div>
             <h3 className="text-xl font-display font-bold mb-2">
                {searchTerm ? "No specific records found" : "Ledger empty"}
             </h3>
             <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-8 italic">
                {searchTerm 
                  ? "Adjust protocol filters or search terms."
                  : "Scan your first bill to populate this archive."
                }
             </p>
             {!searchTerm && (
                <Button onClick={() => navigate("/app/bill-explainer")} className="rounded-full px-8 bg-amber-600 hover:bg-amber-700 shadow-xl shadow-amber-500/20 font-bold uppercase tracking-widest text-[10px]">
                  Scan your first bill
                </Button>
             )}
          </div>
        ) : (
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            {filteredBills.map((bill, index) => {
              const data = bill.structured_data;
              return (
                <div 
                  key={bill.id} 
                  className="group relative transition-all duration-500"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="floating-blob p-6 h-full flex flex-col md:flex-row gap-6 border-white/5 hover:border-amber-500/30 shadow-xl transition-all cursor-pointer overflow-hidden items-center" onClick={() => handleViewBill(bill)}>
                    {/* Date/Icon Area */}
                    <div className="flex flex-col items-center justify-center h-16 w-16 md:h-20 md:w-20 shrink-0 bg-white/5 rounded-3xl border border-white/10 group-hover:border-amber-500/20 transition-all">
                       <p className="text-[10px] font-black uppercase text-muted-foreground">{new Date(bill.created_at || '').toLocaleDateString('en-US', { month: 'short' })}</p>
                       <p className="text-xl font-display font-black tracking-tighter">{new Date(bill.created_at || '').getDate()}</p>
                    </div>

                    <div className="flex-1 min-w-0 space-y-3 text-center md:text-left">
                       <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                          <h3 className="font-display text-lg font-bold truncate group-hover:text-amber-500 transition-colors">
                            {data.hospitalName || "Unidentified Clinic"}
                          </h3>
                          <Badge variant="outline" className="w-fit mx-auto md:mx-0 text-[9px] font-bold uppercase tracking-widest bg-white/5 border-white/5 opacity-60">
                             {data.lineItems?.length || 0} ITEMS
                          </Badge>
                       </div>

                       <div className="flex flex-wrap justify-center md:justify-start gap-4">
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                             <User className="h-3 w-3 text-amber-500/60" />
                             {data.patientName || "System Profile"}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                             <ShieldCheck className="h-3 w-3 text-emerald-500/60" />
                             Confidence {Math.round((data.confidence || 0.7) * 100)}%
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center justify-between gap-4 w-full md:w-auto md:border-l md:border-white/5 md:pl-10">
                       <div className="text-center md:text-right">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Amount</p>
                          <p className="text-xl font-mono font-bold tracking-tight text-amber-500">₹{(data.totalAmount || 0).toLocaleString()}</p>
                       </div>
                       
                       <div className="flex gap-2">
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 text-muted-foreground hover:text-white border border-white/5"
                           onClick={(e) => { e.stopPropagation(); handleViewBill(bill); }}
                         >
                           Expand <ArrowRight className="h-3 w-3 ml-2" />
                         </Button>
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           className="h-9 w-9 p-0 rounded-xl hover:bg-red-500/10 text-muted-foreground/40 hover:text-red-500 transition-colors"
                           onClick={(e) => { e.stopPropagation(); handleDeleteBill(bill.id!); }}
                           disabled={deletingId === bill.id}
                         >
                           {deletingId === bill.id ? (
                             <Loader2 className="h-3 w-3 animate-spin" />
                           ) : (
                             <Trash2 className="h-3.5 w-3.5" />
                           )}
                         </Button>
                       </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviousBills;
