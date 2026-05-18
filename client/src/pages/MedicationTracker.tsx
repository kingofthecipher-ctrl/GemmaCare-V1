import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Plus, Trash2, Clock, Pill, AlertTriangle, CheckCircle, X } from "lucide-react";

const STORAGE_KEY = "gemmacare_medications";

type Frequency = "once_daily" | "twice_daily" | "three_daily" | "four_daily" | "as_needed" | "weekly";
type MedStatus = "active" | "completed" | "paused";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: Frequency;
  startDate: string;
  endDate?: string;
  notes?: string;
  status: MedStatus;
  nextDose?: string;
  createdAt: string;
  doses: DoseLog[];
}

interface DoseLog {
  id: string;
  takenAt: string;
  note?: string;
}

const FREQ_LABELS: Record<Frequency, string> = {
  once_daily: "Once daily",
  twice_daily: "Twice daily",
  three_daily: "3× daily",
  four_daily:  "4× daily",
  as_needed:   "As needed",
  weekly:      "Weekly",
};

function loadMeds(): Medication[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveMeds(meds: Medication[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meds));
}

function AddMedModal({ onAdd, onClose }: { onAdd: (m: Omit<Medication,"id"|"createdAt"|"doses">) => void; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", dosage: "", frequency: "once_daily" as Frequency, startDate: new Date().toISOString().split("T")[0], endDate: "", notes: "", status: "active" as MedStatus });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-card border-border p-6 space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Add Medication</h2><button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5"/></button></div>
        <div className="space-y-3">
          <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Medication Name *</label><input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Amoxicillin" className="w-full mt-1 bg-muted/20 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"/></div>
          <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dosage *</label><input value={form.dosage} onChange={e => set("dosage", e.target.value)} placeholder="e.g. 500mg" className="w-full mt-1 bg-muted/20 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"/></div>
          <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Frequency *</label>
            <select value={form.frequency} onChange={e => set("frequency", e.target.value)} className="w-full mt-1 bg-muted/20 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
              {Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Start Date</label><input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} className="w-full mt-1 bg-muted/20 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"/></div>
            <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">End Date</label><input type="date" value={form.endDate} onChange={e => set("endDate", e.target.value)} className="w-full mt-1 bg-muted/20 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"/></div>
          </div>
          <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes</label><textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Special instructions, side effects to watch..." className="w-full mt-1 bg-muted/20 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none h-20"/></div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={() => { if (!form.name || !form.dosage) return alert("Name and dosage required"); onAdd(form); onClose(); }} className="flex-1">Add Medication</Button>
        </div>
      </Card>
    </div>
  );
}

function MedCard({ med, onDose, onDelete, onToggleStatus }: { med: Medication; onDose: (id: string) => void; onDelete: (id: string) => void; onToggleStatus: (id: string) => void }) {
  const todayDoses = med.doses.filter(d => d.takenAt.startsWith(new Date().toISOString().split("T")[0]));
  const isOverdue = med.status === "active" && med.endDate && new Date(med.endDate) < new Date();
  const statusColors: Record<MedStatus, string> = { active: "text-green-400 bg-green-500/10 border-green-500/30", completed: "text-muted-foreground bg-muted/20 border-border", paused: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" };

  return (
    <Card className={`p-5 border-border bg-card space-y-4 ${isOverdue ? "border-orange-500/40" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><Pill className="h-5 w-5 text-primary"/></div>
          <div>
            <h3 className="font-semibold text-base">{med.name}</h3>
            <p className="text-sm text-muted-foreground">{med.dosage} · {FREQ_LABELS[med.frequency]}</p>
          </div>
        </div>
        <button onClick={() => onDelete(med.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4"/></button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className={`px-2 py-1 rounded-full border font-medium ${statusColors[med.status]}`}>{med.status}</span>
        <span className="px-2 py-1 rounded-full border border-border text-muted-foreground">Started {new Date(med.startDate).toLocaleDateString()}</span>
        {med.endDate && <span className={`px-2 py-1 rounded-full border font-medium ${isOverdue ? "border-orange-500/30 text-orange-400 bg-orange-500/10" : "border-border text-muted-foreground"}`}>Ends {new Date(med.endDate).toLocaleDateString()}</span>}
      </div>

      {med.notes && <p className="text-xs text-muted-foreground bg-muted/20 rounded-lg px-3 py-2">{med.notes}</p>}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="h-3 w-3"/>{todayDoses.length} dose{todayDoses.length !== 1 ? "s" : ""} today</div>
        <div className="flex gap-2">
          <Button onClick={() => onToggleStatus(med.id)} variant="outline" size="sm" className="text-xs h-7 px-2">{med.status === "active" ? "Pause" : "Resume"}</Button>
          {med.status === "active" && <Button onClick={() => onDose(med.id)} size="sm" className="text-xs h-7 px-3 bg-primary"><CheckCircle className="h-3 w-3 mr-1"/>Log Dose</Button>}
        </div>
      </div>

      {todayDoses.length > 0 && (
        <div className="border-t border-border pt-3"><p className="text-xs text-muted-foreground mb-1">Today's doses:</p>
          <div className="flex flex-wrap gap-1">{todayDoses.map(d => <span key={d.id} className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">{new Date(d.takenAt).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}</span>)}</div>
        </div>
      )}
    </Card>
  );
}

export default function MedicationTracker() {
  const [meds, setMeds] = useState<Medication[]>(loadMeds);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<"all" | MedStatus>("all");

  useEffect(() => { saveMeds(meds); }, [meds]);

  const addMed = (data: Omit<Medication,"id"|"createdAt"|"doses">) => {
    setMeds(prev => [...prev, { ...data, id: Date.now().toString(), createdAt: new Date().toISOString(), doses: [] }]);
  };

  const logDose = (id: string) => {
    setMeds(prev => prev.map(m => m.id !== id ? m : { ...m, doses: [...m.doses, { id: Date.now().toString(), takenAt: new Date().toISOString() }] }));
  };

  const deleteMed = (id: string) => {
    if (!confirm("Remove this medication?")) return;
    setMeds(prev => prev.filter(m => m.id !== id));
  };

  const toggleStatus = (id: string) => {
    setMeds(prev => prev.map(m => m.id !== id ? m : { ...m, status: m.status === "active" ? "paused" : "active" }));
  };

  const filtered = filter === "all" ? meds : meds.filter(m => m.status === filter);
  const activeMeds = meds.filter(m => m.status === "active");
  const todayTotal = meds.reduce((acc, m) => acc + m.doses.filter(d => d.takenAt.startsWith(new Date().toISOString().split("T")[0])).length, 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold">Medication Tracker</h1><p className="text-muted-foreground text-sm mt-1">Track patient medications locally. All data stays on this device.</p></div>
        <Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2"/>Add Medication</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: meds.length, icon: Pill },
          { label: "Active", value: activeMeds.length, icon: CheckCircle },
          { label: "Doses Today", value: todayTotal, icon: Clock },
          { label: "Overdue", value: meds.filter(m => m.endDate && new Date(m.endDate) < new Date() && m.status === "active").length, icon: AlertTriangle },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-4 border-border bg-card">
            <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-muted-foreground"/><p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">{label}</p></div>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex rounded-lg border border-border overflow-hidden w-fit">
        {(["all", "active", "paused", "completed"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${filter===f ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 border-border bg-card text-center border-dashed">
          <Pill className="h-10 w-10 text-muted-foreground mx-auto mb-3"/>
          <p className="font-semibold text-muted-foreground">{filter === "all" ? "No medications yet" : `No ${filter} medications`}</p>
          {filter === "all" && <p className="text-sm text-muted-foreground mt-1">Add a medication to start tracking doses</p>}
          {filter === "all" && <Button onClick={() => setShowAdd(true)} variant="outline" className="mt-4"><Plus className="h-4 w-4 mr-2"/>Add First Medication</Button>}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(med => <MedCard key={med.id} med={med} onDose={logDose} onDelete={deleteMed} onToggleStatus={toggleStatus}/>)}
        </div>
      )}

      <div className="flex gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5"/>Medication data is stored locally in your browser. It is not synced to the server or shared.
      </div>

      {showAdd && <AddMedModal onAdd={addMed} onClose={() => setShowAdd(false)}/>}
    </div>
  );
}
