import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useSEO } from "@/hooks/useSEO";

export default function Login() {
  useSEO({ title: "로그인" });

  const [, setLocation] = useLocation();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 중복 체크 상태
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const utils = trpc.useUtils();

  const checkEmailMut = trpc.localAuth.checkAvailability.useQuery(
    { email: email || undefined },
    { enabled: false }
  );
  const checkPhoneMut = trpc.localAuth.checkAvailability.useQuery(
    { phone: phone || undefined },
    { enabled: false }
  );

  const emailTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phoneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    setEmailError("");
    if (!isRegister) return;
    if (emailTimer.current) clearTimeout(emailTimer.current);
    emailTimer.current = setTimeout(async () => {
      if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return;
      try {
        const res = await utils.localAuth.checkAvailability.fetch({ email: val });
        if (res.emailTaken) setEmailError("이미 가입된 이메일입니다.");
      } catch {}
    }, 500);
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    setPhoneError("");
    if (!isRegister) return;
    if (phoneTimer.current) clearTimeout(phoneTimer.current);
    phoneTimer.current = setTimeout(async () => {
      if (!val || val.length < 9) return;
      try {
        const res = await utils.localAuth.checkAvailability.fetch({ phone: val });
        if (res.phoneTaken) setPhoneError("이미 가입된 연락처입니다.");
      } catch {}
    }, 500);
  };

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: async () => {
      toast.success("로그인되었습니다.");
      await utils.auth.me.invalidate();
      await utils.auth.me.refetch();
      setLocation("/");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const registerMutation = trpc.localAuth.register.useMutation({
    onSuccess: async () => {
      toast.success("회원가입이 완료되었습니다.");
      await utils.auth.me.invalidate();
      await utils.auth.me.refetch();
      setLocation("/");
    },
    onError: (err) => {
      if (err.message.includes("이메일")) setEmailError(err.message);
      else if (err.message.includes("연락처")) setPhoneError(err.message);
      else toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      if (password !== confirmPassword) { toast.error("비밀번호가 일치하지 않습니다."); return; }
      if (password.length < 6) { toast.error("비밀번호는 6자 이상이어야 합니다."); return; }
      if (!phone.trim()) { toast.error("연락처를 입력해주세요."); return; }
      if (emailError || phoneError) return;
      registerMutation.mutate({ email, password, name, phone });
    } else {
      loginMutation.mutate({ email, password });
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <Layout>
      <div className="container max-w-md py-16">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: '#5C3D2E' }}>
                <span className="font-sans font-extrabold text-lg text-white tracking-wide">WESHOP</span>
              </div>
            </div>
            <CardTitle className="text-2xl">
              {isRegister ? "회원가입" : "로그인"}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {isRegister ? "새 계정을 만들어 보세요" : "계정에 로그인하세요"}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">이름</label>
                    <Input
                      type="text"
                      placeholder="이름을 입력하세요"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      연락처 <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="tel"
                      placeholder="010-0000-0000"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className={phoneError ? "border-destructive focus-visible:ring-destructive" : ""}
                      required
                    />
                    {phoneError && (
                      <p className="text-xs text-destructive mt-1">{phoneError}</p>
                    )}
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium mb-1.5">아이디 (이메일)</label>
                <Input
                  type="email"
                  placeholder={isRegister ? "아이디로 사용할 이메일을 입력하세요" : "아이디(이메일)를 입력하세요"}
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={emailError ? "border-destructive focus-visible:ring-destructive" : ""}
                  required
                />
                {isRegister && emailError && (
                  <p className="text-xs text-destructive mt-1">{emailError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">비밀번호</label>
                <Input
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={isRegister ? 6 : 1}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                />
              </div>
              {isRegister && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">비밀번호 확인</label>
                  <Input
                    type="password"
                    placeholder="비밀번호를 다시 입력하세요"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-destructive mt-1">비밀번호가 일치하지 않습니다.</p>
                  )}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading || !!(emailError || phoneError)}>
                {isLoading ? "처리 중..." : isRegister ? "회원가입" : "로그인"}
              </Button>
            </form>

            <div className="mt-6 space-y-2 text-center">
              <div>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setPassword("");
                    setConfirmPassword("");
                    setEmailError("");
                    setPhoneError("");
                  }}
                >
                  {isRegister ? "이미 계정이 있으신가요? 로그인" : "계정이 없으신가요? 회원가입"}
                </button>
              </div>
              {!isRegister && (
                <div>
                  <a href="/forgot-account" className="text-sm text-muted-foreground hover:text-primary hover:underline">
                    아이디/비밀번호 찾기
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
