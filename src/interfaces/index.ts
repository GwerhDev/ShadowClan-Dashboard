// Tipos compartidos del Dashboard. Reflejan las respuestas de los endpoints /admin/* y /auth de la API.

// ── Enumeraciones ─────────────────────────────────────────────────────────────

export type SystemRole      = 'walker' | 'user' | 'leader' | 'officer' | 'admin' | 'super_admin';
export type UserStatus      = 'active' | 'pending' | 'inactive';
export type CharacterStatus = 'unclaimed' | 'pending' | 'claimed';
export type ClanStatus      = 'unclaimed' | 'pending' | 'claimed';
export type ClanRole        = 'leader' | 'officer' | 'member';
export type RequestStatus   = 'pending' | 'accepted' | 'rejected';
export type ReviewAction     = 'accept' | 'reject';
export type ActivationAction = 'activate' | 'reject';

// ── Genéricos ─────────────────────────────────────────────────────────────────

export interface PageParams {
  page: number;
  limit: number;
  q?: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface MessageResponse {
  message: string;
}

// ── Usuarios ──────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  battletag: string;
  role: SystemRole;
  status: UserStatus;
  phone?: string;
  character: string[];
  createdAt?: string;
}

/** Datos del usuario autenticado devueltos por GET /auth (personajes poblados). */
export interface AuthUserData {
  id: string;
  battletag: string;
  username: string;
  discriminator: string;
  role: SystemRole;
  phone?: string;
  status: UserStatus;
  character: Character[];
}

export interface AuthResponse {
  logged: boolean;
  userData: AuthUserData | null;
}

export interface UserUpdatePayload {
  role?: string;
  status?: string;
  character?: string[];
  phone?: string;
}

/** Usuario pendiente de activación (GET /admin/user-activations). */
export interface PendingUser {
  _id: string;
  battletag: string;
  role: SystemRole;
  status: UserStatus;
  createdAt?: string;
}

export interface AdminNotifications {
  pendingUsers: PendingUser[];
  counter: number;
}

// ── Personajes ────────────────────────────────────────────────────────────────

/** Referencia mínima a un clan (populate de `name` / `status`). */
export interface ClanRef {
  _id: string;
  name: string;
  status?: ClanStatus;
}

export interface Character {
  _id: string;
  name: string;
  status?: CharacterStatus;
  resonance?: number | null;
  currentClass?: string;
  clan?: ClanRef | null;
  score?: number | null;
  memberStatus?: string;
  armor?: number;
  armorPenetration?: number;
  power?: number;
  resistance?: number;
}

export interface CharacterCreatePayload {
  name: string;
}

export interface CharacterUpdatePayload {
  _id: string;
  name?: string;
  status?: CharacterStatus;
  resonance?: number;
  currentClass?: string;
  memberStatus?: string;
}

/** Payload para vincular / desvincular un personaje a un usuario. */
export interface CharacterLinkPayload {
  userId: string;
  characterId: string;
}

export interface CharacterResponse extends MessageResponse {
  character: Character;
}

export interface CharacterLinkResponse extends CharacterResponse {
  user: User;
}

// ── Clanes ────────────────────────────────────────────────────────────────────

export interface Clan {
  _id: string;
  name: string;
  status?: ClanStatus;
  leader?: Character | null;
  officer?: (Character | string)[];
  member?: (Character | string)[];
  totalMembers?: number;
}

export interface ClanCreatePayload {
  name: string;
}

export interface ClanUpdatePayload {
  _id: string;
  name?: string;
  status?: ClanStatus;
  officer?: string[];
}

export interface ClanMember extends Character {
  role: ClanRole;
}

export interface ClanMembersPage {
  members: ClanMember[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ClanSyncResult {
  processed: number;
  removed: number;
  results: { name: string; status: string }[];
}

// ── Solicitudes ───────────────────────────────────────────────────────────────

export interface RequestUserRef {
  _id: string;
  battletag?: string;
  role?: SystemRole;
}

interface BaseRequest {
  _id: string;
  user?: RequestUserRef;
  status?: RequestStatus;
  createdAt: string;
}

export interface CharacterClaim extends BaseRequest {
  character?: Pick<Character, '_id' | 'name' | 'currentClass' | 'resonance'>;
}

export interface CharacterCreationRequest extends BaseRequest {
  name: string;
  currentClass: string;
  resonance?: number;
}

export interface ClanClaimRequest extends BaseRequest {
  character?: Pick<Character, '_id' | 'name'>;
  clan?: ClanRef;
  requestedRole: 'leader' | 'officer';
}

export interface ClanCreationRequest extends BaseRequest {
  character?: Pick<Character, '_id' | 'name'>;
  clanName: string;
}

export interface ClanJoinRequest extends BaseRequest {
  character?: Pick<Character, '_id' | 'name' | 'currentClass'>;
  clan?: ClanRef;
}

// ── Overview / estadísticas ───────────────────────────────────────────────────

export interface ChartSeries {
  labels: string[];
  counts: number[];
}

export interface OverviewStats {
  totalUsers: number;
  totalClans: number;
  totalCharacters: number;
  claimedCharacters: number;
  walkers: number;
  activeUsers: number;
  pendingUsers: number;
  inactiveUsers: number;
  roleDistribution: Record<SystemRole, number>;
  clanRequests: { pending: number; accepted: number; rejected: number };
  charactersByClass: { label: string; count: number }[];
  clans: { _id: string; name: string; leader: string | null; memberCount: number }[];
  userGrowth: ChartSeries;
}

export type GrowthRange = '30' | '60' | '90' | 'all';

// ── Socket ────────────────────────────────────────────────────────────────────

export type AdminRequestType =
  | 'character-claim'
  | 'character-creation'
  | 'user-activation'
  | 'clan-creation'
  | 'clan-claim'
  | 'clan-join-unclaimed';

/** Payload del evento `admin:request:new` (campos según el tipo de solicitud). */
export interface AdminRequestPayload {
  type: AdminRequestType;
  id: string;
  user?: Partial<RequestUserRef>;
  character?: { _id?: string; name?: string; currentClass?: string; resonance?: number };
  clan?: ClanRef;
  clanName?: string;
  requestedRole?: 'leader' | 'officer';
  createdAt?: string;
}

/** Última señal recibida por socket, que observa la página de solicitudes. */
export type IncomingRequestSignal =
  | (AdminRequestPayload & { _ts: number })
  | { type: 'clan-request-cancelled'; id: string; _ts: number };

// ── Sorteos ───────────────────────────────────────────────────────────────────

export interface Prize {
  _id: string;
  name: string;
  description?: string;
  /** Inactivo: oculto para los clanes (los sorteos pasados lo conservan). */
  active: boolean;
  /** Sorteos en los que se usó (si > 0 no se puede eliminar, solo desactivar). */
  rafflesCount?: number;
}

export type PrizeInput = Partial<Pick<Prize, 'name' | 'description' | 'active'>>;
