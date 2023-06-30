export enum FlowStatus {
    FS_NONE,
    FS_WAITING_VERIFICATION,
    FS_COMPLETED,
    FS_CHALLENGE
}

export enum TokenRole {
    TR_NONE,
    TR_WALLET_VERIFY,
    TR_USER,
    TR_USER_WALLET,
    TR_REFRESH_TOKEN
}

export enum LoginKind {
    LK_NONE,
    LK_INTERNAL,
    LK_WALLET,
    LK_SOCIAL
}
