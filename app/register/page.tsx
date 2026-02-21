"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useStore } from "@/lib/data/store"
import { useAuth } from "@/components/auth-provider"
import { partnerRegistrationSchema, type PartnerRegistrationForm } from "@/lib/validations"
import { type PartnerType, PARTNER_TYPE_LABELS, PROVINCES } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { MapPin, ArrowLeft, ArrowRight, Check, Eye, EyeOff,
  Hotel, UtensilsCrossed, Wine, IceCreamCone, TreePalm, Coffee, Car, Compass, Layers } from "lucide-react"
import { toast } from "sonner"

const PARTNER_TYPE_ICONS: Record<PartnerType, React.ReactNode> = {
  Hotel: <Hotel className="h-6 w-6" />,
  Restaurante: <UtensilsCrossed className="h-6 w-6" />,
  Bar: <Wine className="h-6 w-6" />,
  Geladaria: <IceCreamCone className="h-6 w-6" />,
  Resort: <TreePalm className="h-6 w-6" />,
  Cafeteria: <Coffee className="h-6 w-6" />,
  RentACar: <Car className="h-6 w-6" />,
  GuiaTuristico: <Compass className="h-6 w-6" />,
  Mista: <Layers className="h-6 w-6" />,
}

const SELECTABLE_TYPES: PartnerType[] = [
  "Hotel", "Restaurante", "Bar", "Geladaria", "Resort", "Cafeteria", "RentACar", "GuiaTuristico", "Mista"
]

const MISTA_SUB_TYPES: PartnerType[] = [
  "Hotel", "Restaurante", "Bar", "Geladaria", "Resort", "Cafeteria", "RentACar", "GuiaTuristico"
]

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [selectedType, setSelectedType] = useState<PartnerType | null>(null)
  const [mistaSubTypes, setMistaSubTypes] = useState<PartnerType[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const store = useStore()
  const { login } = useAuth()
  const router = useRouter()

  const form = useForm<PartnerRegistrationForm>({
    resolver: zodResolver(partnerRegistrationSchema),
    defaultValues: {
      companyName: "",
      nif: "",
      phone: "",
      email: "",
      province: "",
      city: "",
      bairro: "",
      rua: "",
      loginEmail: "",
      password: "",
      confirmPassword: "",
    },
  })

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const handleTypeSelect = (type: PartnerType) => {
    setSelectedType(type)
    if (type !== "Mista") {
      setMistaSubTypes([])
    }
  }

  const toggleMistaSub = (type: PartnerType) => {
    setMistaSubTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const canProceedStep1 = selectedType && (selectedType !== "Mista" || mistaSubTypes.length >= 2)

  const handleNext = async () => {
    if (step === 2) {
      const valid = await form.trigger(["companyName", "nif", "phone", "email", "province", "city", "bairro", "rua"])
      if (!valid) return
    }
    if (step === 3) {
      const valid = await form.trigger(["loginEmail", "password", "confirmPassword"])
      if (!valid) return
    }
    setStep((s) => Math.min(s + 1, totalSteps))
  }

  const handleBack = () => setStep((s) => Math.max(s - 1, 1))

  const handleSubmit = () => {
    if (!selectedType) return
    const values = form.getValues()

    const existing = store.state.partners.find((p) => p.loginEmail === values.loginEmail || p.nif === values.nif)
    if (existing) {
      toast.error("Ja existe um parceiro com este email ou NIF")
      return
    }

    const partner = store.addPartner({
      type: selectedType,
      mistaSubTypes: selectedType === "Mista" ? mistaSubTypes : undefined,
      companyName: values.companyName,
      nif: values.nif,
      phone: values.phone,
      email: values.email,
      loginEmail: values.loginEmail,
      password: values.password,
      province: values.province,
      city: values.city,
      bairro: values.bairro,
      rua: values.rua,
    })

    store.addLog({
      userId: partner.id,
      userType: "partner",
      action: "Registo",
      details: `Parceiro ${values.companyName} registado como ${PARTNER_TYPE_LABELS[selectedType]}`,
    })

    login(values.loginEmail, values.password, [...store.state.partners, partner], store.state.admins)
    toast.success("Registo realizado com sucesso!")
    router.push("/partner/documents")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <MapPin className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground">Registar Parceiro</CardTitle>
          <CardDescription className="text-muted-foreground">
            Passo {step} de {totalSteps}
          </CardDescription>
          <Progress value={progress} className="mt-3 h-2" />
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-foreground">Tipo de Parceiro</h3>
              <div className="grid grid-cols-3 gap-3">
                {SELECTABLE_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeSelect(type)}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                      selectedType === type
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/50"
                    }`}
                  >
                    {PARTNER_TYPE_ICONS[type]}
                    <span className="text-sm font-medium">{PARTNER_TYPE_LABELS[type]}</span>
                  </button>
                ))}
              </div>
              {selectedType === "Mista" && (
                <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/50 p-4">
                  <p className="text-sm font-medium text-foreground">Selecione pelo menos 2 sub-tipos:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {MISTA_SUB_TYPES.map((type) => (
                      <label key={type} className="flex items-center gap-2 text-sm text-foreground">
                        <Checkbox
                          checked={mistaSubTypes.includes(type)}
                          onCheckedChange={() => toggleMistaSub(type)}
                        />
                        {PARTNER_TYPE_LABELS[type]}
                      </label>
                    ))}
                  </div>
                  {mistaSubTypes.length < 2 && mistaSubTypes.length > 0 && (
                    <p className="text-xs text-destructive">Selecione pelo menos 2 sub-tipos</p>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-foreground">Informacoes da Empresa</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="companyName" className="text-foreground">Nome da Empresa</Label>
                  <Input id="companyName" {...form.register("companyName")} placeholder="Nome da empresa" />
                  {form.formState.errors.companyName && (
                    <p className="text-xs text-destructive">{form.formState.errors.companyName.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="nif" className="text-foreground">NIF (14 digitos)</Label>
                  <Input id="nif" {...form.register("nif")} placeholder="00000000000000" maxLength={14} />
                  {form.formState.errors.nif && (
                    <p className="text-xs text-destructive">{form.formState.errors.nif.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phone" className="text-foreground">Telefone</Label>
                  <Input id="phone" {...form.register("phone")} placeholder="923456789" />
                  {form.formState.errors.phone && (
                    <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input id="email" type="email" {...form.register("email")} placeholder="empresa@email.com" />
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="province" className="text-foreground">Provincia</Label>
                  <Select onValueChange={(v) => form.setValue("province", v)} defaultValue={form.getValues("province")}>
                    <SelectTrigger id="province">
                      <SelectValue placeholder="Selecione a provincia" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVINCES.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.province && (
                    <p className="text-xs text-destructive">{form.formState.errors.province.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="city" className="text-foreground">Cidade</Label>
                  <Input id="city" {...form.register("city")} placeholder="Cidade" />
                  {form.formState.errors.city && (
                    <p className="text-xs text-destructive">{form.formState.errors.city.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="bairro" className="text-foreground">Bairro</Label>
                  <Input id="bairro" {...form.register("bairro")} placeholder="Bairro" />
                  {form.formState.errors.bairro && (
                    <p className="text-xs text-destructive">{form.formState.errors.bairro.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="rua" className="text-foreground">Rua</Label>
                  <Input id="rua" {...form.register("rua")} placeholder="Rua e numero" />
                  {form.formState.errors.rua && (
                    <p className="text-xs text-destructive">{form.formState.errors.rua.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-foreground">Credenciais de Acesso</h3>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="loginEmail" className="text-foreground">Email de Login</Label>
                  <Input id="loginEmail" type="email" {...form.register("loginEmail")} placeholder="login@email.com" />
                  {form.formState.errors.loginEmail && (
                    <p className="text-xs text-destructive">{form.formState.errors.loginEmail.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password" className="text-foreground">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...form.register("password")}
                      placeholder="Minimo 6 caracteres"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Min. 6 caracteres, 1 numero, 1 caractere especial</p>
                  {form.formState.errors.password && (
                    <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="confirmPassword" className="text-foreground">Confirmar Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      {...form.register("confirmPassword")}
                      placeholder="Repetir senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {form.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-foreground">Confirmar Dados</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <dl className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">Tipo:</dt>
                    <dd className="text-foreground">{selectedType ? PARTNER_TYPE_LABELS[selectedType] : ""}</dd>
                  </div>
                  {selectedType === "Mista" && (
                    <div className="flex justify-between">
                      <dt className="font-medium text-muted-foreground">Sub-tipos:</dt>
                      <dd className="text-foreground text-right">{mistaSubTypes.map((t) => PARTNER_TYPE_LABELS[t]).join(", ")}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">Empresa:</dt>
                    <dd className="text-foreground">{form.getValues("companyName")}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">NIF:</dt>
                    <dd className="text-foreground">{form.getValues("nif")}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">Telefone:</dt>
                    <dd className="text-foreground">{form.getValues("phone")}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">Email:</dt>
                    <dd className="text-foreground">{form.getValues("email")}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">Endereco:</dt>
                    <dd className="text-foreground text-right">
                      {form.getValues("province")}, {form.getValues("city")}, {form.getValues("bairro")}, {form.getValues("rua")}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">Login:</dt>
                    <dd className="text-foreground">{form.getValues("loginEmail")}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
            ) : (
              <Link href="/login">
                <Button type="button" variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              </Link>
            )}
            {step < totalSteps ? (
              <Button type="button" onClick={handleNext} disabled={step === 1 && !canProceedStep1}>
                Proximo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit}>
                <Check className="mr-2 h-4 w-4" />
                Confirmar Registo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
