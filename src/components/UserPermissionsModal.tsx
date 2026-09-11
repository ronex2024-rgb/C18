import React, { useState } from 'react';
import { UserProfile, Language, UserPermissionSet } from '../types';
import { translations } from '../utils/translations';
import {
  Shield,
  X,
  Check,
  Ban,
  Lock,
  UserCheck,
  KeyRound,
  Sliders,
  AlertOctagon,
  Flame,
  FileCheck,
  Camera,
  Users,
  Building2
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  lang: Language;
  onSelectUser: (user: UserProfile) => void;
  onUpdatePermissions?: (userId: string, newPermissions: UserPermissionSet) => void;
}

export const UserPermissionsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  lang,
  onSelectUser,
  onUpdatePermissions
}) => {
  const t = translations[lang];
  const isAr = lang === 'ar';

  const [activeTabUserId, setActiveTabUserId] = useState<string>(currentUser.id);
  const selectedUser = allUsers.find((u) => u.id === activeTabUserId) || currentUser;

  if (!isOpen) return null;

  const handleTogglePermission = (key: keyof UserPermissionSet) => {
    if (!currentUser.permissions.canManageUsers && currentUser.id !== selectedUser.id) {
      alert(isAr ? 'تنبيه: يتطلب تعديل صلاحيات المستخدمين الآخرين رتبة مدير المصنع' : 'Only Plant Director can modify permissions for other users.');
      return;
    }

    if (onUpdatePermissions) {
      const updated: UserPermissionSet = {
        ...selectedUser.permissions,
        [key]: !selectedUser.permissions[key]
      };
      onUpdatePermissions(selectedUser.id, updated);
    }
  };

  const permissionItems: {
    key: keyof UserPermissionSet;
    labelEn: string;
    labelAr: string;
    descEn: string;
    descAr: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      key: 'canHaltCigaretteLines',
      labelEn: 'Emergency Halt Cigarette Maker Lines',
      labelAr: 'الإيقاف الطارئ لخطوط تصنيع السجائر',
      descEn: 'Authorize instant shutdown of cigarette makers (Hauni/Molins/GD) upon live beetle detection.',
      descAr: 'صلاحية إيقاف ماكينات السجائر فوراً عند رصد خنافس في قمع التغذية.',
      icon: <AlertOctagon className="w-4 h-4" />,
      color: 'text-red-400 bg-red-500/10 border-red-500/30'
    },
    {
      key: 'canCalibrateCameraAi',
      labelEn: 'Calibrate Optical AI Vision Models',
      labelAr: 'معايرة نماذج كاميرات الذكاء الاصطناعي',
      descEn: 'Adjust neural network confidence thresholds, dust filtering, and macro focal lenses.',
      descAr: 'تعديل حدود ثقة الشبكة العصبية وتصفية شوائب أوراق التبغ ومعايرة العدسات.',
      icon: <Camera className="w-4 h-4" />,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    },
    {
      key: 'canOverrideHvac',
      labelEn: 'Override Factory HVAC & Dew Point',
      labelAr: 'التحكم بتكييف المصنع ونقطة الندى والرطوبة',
      descEn: 'Modify temperature, humidity setpoints, and activate blast chilling or desiccation modes.',
      descAr: 'تعديل درجات الحرارة والرطوبة وتفعيل التبريد القاتل والتجفيف الوقائي.',
      icon: <Sliders className="w-4 h-4" />,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
    },
    {
      key: 'canTriggerFumigation',
      labelEn: 'Authorize Phosphine (PH3) Fumigation',
      labelAr: 'التصريح بتبخير التبغ بغاز الفوسفين (PH3)',
      descEn: 'High-toxicity gas clearance required for sealed leaf chambers and silos.',
      descAr: 'إصدار تصريح الغاز عالي السمية لتبخير غرف بالات التبغ وصوامع التقطيع.',
      icon: <Flame className="w-4 h-4" />,
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/30'
    },
    {
      key: 'canSignPhytosanitaryCert',
      labelEn: 'Sign Certified Phytosanitary Certificate',
      labelAr: 'توقيع الشهادة الحجرية المعتمدة (CORESTA/ISO)',
      descEn: 'Endorse regulatory pest-free certificates for cigarette export shipments.',
      descAr: 'اعتماد الشهادات الحجرية لخلو شحنات السجائر المصدرة من سوسة التبغ.',
      icon: <FileCheck className="w-4 h-4" />,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    {
      key: 'canEditTraps',
      labelEn: 'Reconfigure Physical Smart Traps',
      labelAr: 'تعديل وتكوين المصائد الذكية والفيرمونات',
      descEn: 'Log Serricornin lure replacements, sync counts, and configure LoRaWAN nodes.',
      descAr: 'تسجيل استبدال كبسولات السيريكورنين وتعديل إحداثيات ومواقع المصائد.',
      icon: <KeyRound className="w-4 h-4" />,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30'
    },
    {
      key: 'canManageUsers',
      labelEn: 'Grant & Revoke Operator Privileges (Admin)',
      labelAr: 'إدارة وتعيين صلاحيات المشغلين (مسؤول النظام)',
      descEn: 'Manage plant security clearances and operator access credentials.',
      descAr: 'منح وسحب الصلاحيات وتعديل مستويات التصريح الأمني بالمصنع.',
      icon: <Users className="w-4 h-4" />,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
    },
    {
      key: 'canExportAuditLogs',
      labelEn: 'Access Certified Audit Trail',
      labelAr: 'الاطلاع على سجلات التدقيق الحجري وتصديرها',
      descEn: 'View historical temperature logs, degree-day calculations, and trap inspections.',
      descAr: 'الوصول لسجلات درجات الحرارة الحجرية وتاريخ الفحوصات الميدانية.',
      icon: <Shield className="w-4 h-4" />,
      color: 'text-slate-300 bg-slate-800 border-slate-700'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {t.permissionsTitle}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                  CORESTA RBAC
                </span>
              </h3>
              <p className="text-xs text-slate-400">{t.permissionsSubtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two Columns */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x md:divide-slate-800">
          {/* Left Column: Role Selector (4 cols) */}
          <div className="md:col-span-4 p-4 space-y-2 bg-slate-950/50">
            <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>{isAr ? 'أدوار مصنع السجائر' : 'Factory User Profiles'}</span>
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
            </div>

            <div className="space-y-1.5">
              {allUsers.map((user) => {
                const isSelected = user.id === activeTabUserId;
                const isCurrent = user.id === currentUser.id;

                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setActiveTabUserId(user.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {user.avatarInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">
                          {isAr ? user.nameAr : user.nameEn}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {isAr ? user.roleAr : user.roleEn}
                        </p>
                      </div>
                    </div>

                    {isCurrent && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap font-mono">
                        {isAr ? 'أنت' : 'You'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Switch Button */}
            {selectedUser.id !== currentUser.id && (
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => onSelectUser(selectedUser)}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  {isAr ? `التبديل إلى ${selectedUser.nameAr}` : `Switch to ${selectedUser.nameEn}`}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Permission Matrix for selectedUser (8 cols) */}
          <div className="md:col-span-8 p-6 space-y-6">
            {/* Selected User Badge Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-extrabold text-base flex items-center justify-center shadow-lg">
                  {selectedUser.avatarInitials}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {isAr ? selectedUser.nameAr : selectedUser.nameEn}
                  </h4>
                  <p className="text-xs text-amber-400 font-medium">
                    {isAr ? selectedUser.roleAr : selectedUser.roleEn}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {isAr ? selectedUser.departmentAr : selectedUser.departmentEn}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {selectedUser.clearanceLevel}
                </span>
                {selectedUser.assignedFacilityLine && (
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    {selectedUser.assignedFacilityLine}
                  </p>
                )}
              </div>
            </div>

            {/* Permissions Check Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                <span>{isAr ? 'الصلاحيات والوظائف الحيوية' : 'Biosecurity Privileges'}</span>
                <span>{isAr ? 'الحالة والموافقة' : 'Authorization'}</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {permissionItems.map((perm) => {
                  const isGranted = selectedUser.permissions[perm.key];

                  return (
                    <div
                      key={perm.key}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`p-2 rounded-lg border flex-shrink-0 ${perm.color}`}>
                          {perm.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-100 truncate">
                            {isAr ? perm.labelAr : perm.labelEn}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                            {isAr ? perm.descAr : perm.descEn}
                          </p>
                        </div>
                      </div>

                      {/* Permission State Toggle */}
                      <button
                        type="button"
                        onClick={() => handleTogglePermission(perm.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          isGranted
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-slate-800/80 text-slate-500 border border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        {isGranted ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            {t.permissionGranted}
                          </>
                        ) : (
                          <>
                            <Ban className="w-3.5 h-3.5 text-slate-500" />
                            {t.permissionDenied}
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>
              {isAr
                ? 'يتم تشفير وتوثيق كافة الصلاحيات الحجرية وفق معايير سلامة الأغذية والتبغ ISO 22000'
                : 'All biosecurity role privileges are audited and compliant with ISO 22000 & CORESTA Guide No. 2'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
