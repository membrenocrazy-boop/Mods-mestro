"use strict";
/*
 * Animal Rivals | rasp.bat
 *
 * Clean Animal Rivals menu derived from the visual/menu conventions of the
 * user's rasp.bat UNOBF project.  This is intentionally a new, reduced source:
 * it contains only the requested categories, navigation, mods, and soundboard.
 *
 * Supported target:
 *   package: com.dogelabs.deadeye
 *   build compatibility: detected and validated at runtime
 *   metadata: current dump.cs (Android ARM64)
 *
 * Load after frida-il2cpp-bridge.js and deadeye-symbols.js.
 */
const MENU_NAME = "Animal Rivals | rasp.bat";
const RAPID_FIRE_INTERVAL = 0.03;
const TRIGGER_FLY_SPEED = 40.6;
const JOYSTICK_FLY_SPEED = 9.0;
const JOYSTICK_FLY_TURN_SPEED = 105.0;
const JOYSTICK_DEADZONE = 0.08;
const SPEED_BOOST_JUMP_MULTIPLIER_DELTA = 1.5;
const SPEED_BOOST_MAX_SPEED_DELTA = 9.0;
const SPEED_BOOST_VELOCITY_CAP = 28.0;
const RIG_SPIN_SPEED_STEP = 1;
const RIG_SPIN_SPEED_MIN = 1;
const RIG_SPIN_SPEED_MAX = 10;
const RIG_SPIN_SPEED_DEGREES = 2.5;
const RIG_SPAM_COOLDOWN_SECONDS = 0.18;
const RIG_SPAM_CLONE_LIFETIME_SECONDS = 10.0;
const RIG_SPAM_MAX_ACTIVE_CLONES = 6;
// Rig Spam - enforce renderer visibility every frame (fix invisible clones)
const RIG_SPAM_VISIBILITY_ENFORCE_EVERY_FRAMES = 1;
// Titles system
const TITLE_SPAM_INTERVAL_SECONDS = 0.12;
const TITLE_STICKY_REFRESH_FRAMES = 90;
// Real progression ranks. Fusion replicates XP, not a free-form rank string, so
// using the game's own level table is what makes the temporary rank agree on
// every client and gives it a well-defined native gradient.
const ANIMAL_RIVALS_TITLES = [
    "Chimp Recruit", "Chimp Recruit L2", "Chimp Rascal", "Chimp Brawler", "Chimpion",
    "Monke", "Monke Chunkey", "Monke Corporal", "Monke Staff Sergeant", "Monke #1",
    "Baboon Chimp", "Baboon Specialist", "Baboon Staff Sergeant", "Baboon Staff Sergeant II", "Baboon Staff Sergeant III",
    "Big Monke", "Bigger Monke", "Biggest Monke", "Bigly Monke", "Most Bigly Monke",
    "Gorilla Grunt", "Glorilla", "Brorilla", "Florilla", "Gorilla Chilla",
    "Battle Hardened", "Battle Scarred", "Battle Predator", "Battle Commando", "Battle Warlord",
    "Rampage Randy", "Rampager", "Rampager Danger", "Rampager Rager", "Rampager Major",
    "Silverback I", "Silverback II", "Silverback III", "Silverback Stunna", "Silverestback",
    "Titan", "Titan Toon", "Titanzee", "Titanosaur", "Titanolodon",
    "Ape-X", "Ape-X Major", "Ape-X Prince", "Ape-X King", "Ape Primal Emperor",
    "King Pong", "King Pong II", "King Pong III", "King Pong IV", "King Pong Gone",
    "Everblasting", "Everblasting II", "Everblasting III", "Everblasting IV", "Everglocking V",
    "Invinci-bull I", "Invinci-bull II", "Invinci-bull III", "Invinci-bull IV", "Invicipocalypse",
    "Sabertooth I", "Sabertooth II", "Sabertooth III", "Sabertooth IV", "Sabertooth Savage",
    "Lion Apprentice", "Lion EXPERT", "Lion PRO", "Lion El Messy", "The Goat Lion",
    "Supreme Shark", "Supreme Shark II", "Supreme Shark III", "Supreme Shark IV", "Supremest Shark",
    "Apex Falcon", "Apex Panda", "Apex Panther", "Apex Predator", "Apex Terminator",
    "Beastly Major", "Beastly Commando",
].map((label, index) => ({ id: "rank_" + String(index + 1).padStart(3, "0"), label, level: index + 1 }));
const AIMBOT_TARGET_REFRESH_FRAMES = 30;
const AIMBOT_EMPTY_TARGET_REFRESH_FRAMES = 60;
const AIMBOT_TARGET_POINT_REFRESH_FRAMES = 3;
const AIMBOT_VISUAL_REFRESH_FRAMES = 3;
const AIMBOT_AIM_TRANSFORM_RECHECK_FRAMES = 300;
const RIG_HITBOX_SCALE = 2.8;
const EXTEND_HITBOX_REFRESH_FRAMES = 180;
const LONG_ARMS_MULTIPLIER = 2.5;
const LONG_ARMS_BODY_SCALE = 1.6;
const VISUAL_SCAN_INTERVAL_FRAMES = 180;
const CHAM_RENDERER_RESCAN_FRAMES = 240;
const CHAM_SCAN_INTERVAL = 1;
const HP_TEXT_REFRESH_FRAMES = 12;
const HP_POSITION_REFRESH_FRAMES = 6;
const INVISIBILITY_RESCAN_FRAMES = 180;
const MAX_VISUAL_TARGETS = 16;
const MAX_CHAM_RENDERERS_PER_TARGET = 12;
const LOCAL_CONTROLLER_RECHECK_MS = 2000;
const LOCAL_CONTROLLER_STALE_MS = 1500;
const APPLICATION_FOCUS_POLL_CALLS = 10;
const APPLICATION_FOCUS_GRACE_FRAMES = 240;
const UNLOCK_TRANSITION_RESTORE_DELAY_MS = 4000;
const UNLOCK_TRANSITION_SAME_PLAYER_DELAY_MS = 12000;
const UNLOCK_TRANSITION_STABLE_FRAMES = 90;
const UNLOCK_TRANSITION_RETRY_FRAMES = 120;
const UNLOCK_TRANSITION_MAX_RETRIES = 8;
const UNLOCK_TRANSITION_MAX_COSMETICS = 32;
const UNLOCK_TRANSITION_OVERRIDE_SOURCE = "rasp_room_restore";
const ENABLE_EXPERIMENTAL_MIC_MIXER = false;
const OVERPOWERED_ACTION_COOLDOWN = 2.0;
const NUKE_ACTION_COOLDOWN = 8.0;
const TP_ALL_REPEATS = 12;
const TP_ALL_REPEAT_INTERVAL_FRAMES = 6;
const TP_ALL_COOLDOWN_SECONDS = 0.22;
const GRENADE_LAUNCH_SPEED = 22.0;
const GRENADE_LAUNCH_COOLDOWN = 0.075;
const GRENADE_PREFAB_RETRY_SECONDS = 10.0;
const GRENADE_TEMPLATE_RETRY_SECONDS = 6.0;
const GRENADE_VARIANTS = [
    {
        name: "Frag",
        classNames: ["Deadeye.Throwables.GrenadeProjectile", "GrenadeProjectile"],
        prefabNames: ["FragGrenadeProjectile"],
        resourcePaths: ["FragGrenadeProjectile", "Weapons/FragGrenadeProjectile", "Projectiles/FragGrenadeProjectile"],
    },
    {
        name: "Flashbang",
        classNames: ["Deadeye.Throwables.GrenadeProjectile", "GrenadeProjectile"],
        prefabNames: ["FlashbangProjectile"],
        resourcePaths: ["FlashbangProjectile", "Weapons/FlashbangProjectile", "Projectiles/FlashbangProjectile"],
    },
    {
        name: "Smoke",
        classNames: ["Deadeye.Throwables.GrenadeProjectile", "GrenadeProjectile"],
        prefabNames: ["SmokeGrenadeProjectile"],
        resourcePaths: ["SmokeGrenadeProjectile", "Weapons/SmokeGrenadeProjectile", "Projectiles/SmokeGrenadeProjectile"],
    },
    {
        name: "Sticky Frag",
        classNames: ["Deadeye.Throwables.GrenadeProjectile", "GrenadeProjectile"],
        prefabNames: ["StickyFragProjectile"],
        resourcePaths: ["StickyFragProjectile", "Weapons/StickyFragProjectile", "Projectiles/StickyFragProjectile"],
    },
    {
        name: "Sticky Ranger",
        classNames: ["Deadeye.Throwables.GrenadeProjectile", "GrenadeProjectile"],
        prefabNames: ["StickyFragProjectile_SpaceRanger"],
        resourcePaths: ["StickyFragProjectile_SpaceRanger", "Weapons/StickyFragProjectile_SpaceRanger", "Projectiles/StickyFragProjectile_SpaceRanger"],
    },
    {
        name: "Sticky Ranger Blue",
        classNames: ["Deadeye.Throwables.GrenadeProjectile", "GrenadeProjectile"],
        prefabNames: ["StickyFragProjectile_SpaceRanger_Blue"],
        resourcePaths: ["StickyFragProjectile_SpaceRanger_Blue", "Weapons/StickyFragProjectile_SpaceRanger_Blue", "Projectiles/StickyFragProjectile_SpaceRanger_Blue"],
    },
    {
        name: "Sticky Ranger Red",
        classNames: ["Deadeye.Throwables.GrenadeProjectile", "GrenadeProjectile"],
        prefabNames: ["StickyFragProjectile_SpaceRanger_Red"],
        resourcePaths: ["StickyFragProjectile_SpaceRanger_Red", "Weapons/StickyFragProjectile_SpaceRanger_Red", "Projectiles/StickyFragProjectile_SpaceRanger_Red"],
    },
    {
        name: "Instant Blast",
        classNames: ["Deadeye.Throwables.GrenadeProjectile", "GrenadeProjectile"],
        prefabNames: ["InstantExplodeProjectile"],
        resourcePaths: ["InstantExplodeProjectile", "Weapons/InstantExplodeProjectile", "Projectiles/InstantExplodeProjectile"],
    },
    {
        name: "Instant Vertical",
        classNames: ["Deadeye.Throwables.GrenadeProjectile", "GrenadeProjectile"],
        prefabNames: ["InstantExplodeProjectile_VerticalCylinder"],
        resourcePaths: ["InstantExplodeProjectile_VerticalCylinder", "Weapons/InstantExplodeProjectile_VerticalCylinder", "Projectiles/InstantExplodeProjectile_VerticalCylinder"],
    },
];
const NUKE_GRENADE_COUNT = 50;
const NUKE_GRENADES_PER_FRAME = 1;
const NUKE_MAX_STALLED_FRAMES = 300;
const PLATFORM_HAND_OFFSET_Y = 0.16;
const VFX_ID_FALLBACK_COUNT = 64;
const VFX_ID_MAX_COUNT = 256;
const VFX_GUN_RANGE = 40.0;
const VFX_GUN_FIRE_INTERVAL = 0.25;
const VFX_GUN_POINTER_REFRESH_FRAMES = 2;
const VFX_GUN_START_OFFSET = 0.14;
const VFX_GUN_HIT_OFFSET = 0.04;
const VFX_GUN_TIP_SCALE = 0.12;
const VFX_GUN_LINE_START_WIDTH = 0.014;
const VFX_GUN_LINE_END_WIDTH = 0.010;
const SPAWN_GUN_COIL_POINTS = 25;
const SPAWN_GUN_COIL_TURNS = 7;
const SPAWN_GUN_COIL_RADIUS = 0.035;
const SPAWN_GUN_MAX_LOCAL_OBJECTS = 24;
const VFX_GUN_RAYCAST_LAYER_MASK = -1;
const VFX_GUN_RAYCAST_TRIGGER_INTERACTION = 2;
const VFX_GUN_COLOR_HOLD = [0.10, 1.0, 0.20, 1.0];
const REMOVE_STREAK_TRIGGER_COOLDOWN = 0.12;
const REMOVE_STREAK_SCAN_RADIUS = 0.06;
const REMOVE_STREAK_MAX_RANGE = 90.0;
const HITBOX_VISUAL_REFRESH_FRAMES = 18;
const HITBOX_VISUAL_RESCAN_FRAMES = 180;
const MAX_HITBOX_VISUALS = 16;
const MAX_HITBOX_VISUALS_PER_TARGET = 3;
const PLATFORM_SCALE = [0.35, 0.025, 0.35];
const PLATFORM_COLOR = [1.0, 0.00, 0.00, 0.95];
const MENU_PAGE_SIZE = 8;
const MENU_BUTTON_PREFIX = "AnimalRivalsMenuButton:";
const EAC_ROOT_SCALE = [0.1, 0.3, 0.3825];
const EAC_MENU_SCALE = 0.9;
const MENU_POINTER_SCALE = [0.01, 0.01, 0.01];
const MENU_POINTER_LOCAL_POSITION = [0.01, -0.117, 0.05];
const MENU_POINTER_TOUCH_RADIUS = 0.005;
const MENU_POINTER_DEBOUNCE_SECONDS = 0.2;
const COLORS = {
    background: [0.01, 0.01, 0.01, 0.96],
    outline: [0.27, 0.035, 0.035, 1.0],
    button: [0.55, 0.10, 0.10, 0.96],
    buttonHover: [0.70, 0.12, 0.12, 1.0],
    buttonEnabled: [0.85, 0.10, 0.10, 1.0],
    buttonEnabledHover: [1.0, 0.16, 0.16, 1.0],
    text: [1.0, 1.0, 1.0, 1.0],
    subtext: [1.0, 0.30, 0.30, 1.0],
};
const mods = {
    triggerFly: false,
    joystickFly: false,
    speedBoost: false,
    longArms: false,
    platforms: false,
    infiniteAmmo: false,
    noCooldown: false,
    rapidFire: false,
    noRecoil: false,
    aimbot: false,
    grenadeLauncher: false,
    killInLobby: false,
    useGunsInLobby: false,
    unlockAll: false,
    titleSpam: false,
    invincibility: false,
    invisibility: false,
    tracers: false,
    chams: false,
    showHp: false,
    showHitboxes: false,
    vfxGun: false,
    extendHitboxes: false,
    spinBot: false,
    rigSpam: false,
    removeStreakGun: false,
};
const soundboardSounds = (() => {
    try {
        const manifest = globalThis.__RASP_SOUNDBOARD;
        if (!manifest || manifest.version !== 1 || !Array.isArray(manifest.sounds))
            return [];
        return manifest.sounds.filter((sound) => sound && typeof sound.id === "string" && typeof sound.label === "string" &&
            typeof sound.fileName === "string" && (sound.format === "mp3" || sound.format === "wav") &&
            Array.isArray(sound.base64Chunks));
    }
    catch (_) {
        return [];
    }
})();
let currentCategory = "Main";
let currentPage = 0;
let activeSoundIndex = -1;
let soundboardBusy = false;
let soundboardOutgoingVoice = null;
let soundboardPcm = null;
let soundboardPcmCursor = 0.0;
let soundboardPcmRate = 24000;
let soundboardPcmChannels = 1;
let soundboardVoiceRate = 24000;
let soundboardVoiceChannels = 1;
let soundboardMixFault = false;
let soundboardMixFaultLogged = false;
let soundboardPcmFinished = false;
let soundboardPttState = null;
let soundboardMixerHooksInstalled = false;
let soundboardShortHookInstalled = false;
let soundboardFloatHookInstalled = false;
let menuRoot = null;
let menuFrontSurface = null;
let menuTextRenderers = [];
let menuTextFrontVisible = true;
let renderedButtons = [];
let hoveredButtonId = "";
let menuPointer = null;
let menuPointerCollider = null;
let menuPointerTouchArmed = true;
let menuPointerCooldownUntil = 0.0;
let menuFont = null;
let inputOutBool = null;
let inputOutVector2 = null;
let leftSecondary = false;
let rightSecondary = false;
let rightSecondaryDown = false;
let rightSecondaryWasPressed = false;
let leftTrigger = false;
let leftTriggerAmount = 0.0;
let rightTrigger = false;
let rightTriggerAmount = 0.0;
let leftGrip = false;
let rightGrip = false;
let selectedGrenadeVariant = 0;
let leftStickX = 0.0;
let leftStickY = 0.0;
let rightStickX = 0.0;
let rightStickY = 0.0;
let frameNumber = 0;
let pendingAmmoSweep = false;
let pendingCooldownReset = false;
let cooldownResetRetryFrame = 0;
let pendingUnlockRefresh = false;
let unlockRefreshFrames = [];
let unlockTransitionCosmetics = [];
let unlockTransitionRestorePending = false;
let unlockTransitionRestoreNotBefore = 0;
let unlockTransitionSamePlayerNotBefore = 0;
let unlockTransitionSourcePlayerKey = "";
let unlockTransitionStableFrames = 0;
let unlockTransitionRetryFrame = 0;
let unlockTransitionRestoreAttempts = 0;
let unlockTransitionConfirmedContentTypes = new Set();
let unlockTransitionWeapons = null;
let unlockTransitionWeaponsPin = null;
let pendingInvincibilityRefresh = false;
let pendingTeleportRepeats = [];
let lastGrenadeLaunchTime = -1000.0;
let lastGrenadePrefabWarningTime = -1000.0;
let grenadePrefabRetryAt = -1000.0;
let cachedClipboardWeapon = null;
let cachedGrenadePrefab = null;
let cachedGrenadePrefabVariant = -1;
let cachedProjectileWeaponTemplate = null;
let projectileWeaponTemplateRetryAt = -1000.0;
let pendingNukeGrenades = 0;
let nukeStalledFrames = 0;
let leftHandPlatform = null;
let rightHandPlatform = null;
let selectedVfxCatalogIndex = 0;
let vfxCatalog = Array.from({ length: VFX_ID_FALLBACK_COUNT }, (_, id) => ({ id, name: "VFX ID " + id }));
let vfxCatalogResolved = false;
let vfxCatalogNextResolveAt = -1000.0;
let spawnPrefabCatalog = [];
let selectedSpawnPrefabIndex = 0;
let spawnPrefabCatalogResolved = false;
let spawnPrefabCatalogNextResolveAt = -1000.0;
let spawnPrefabCatalogGeneration = 0;
let spawnGunTriggerWasPressed = false;
let spawnGunLocalObjects = [];
let vfxGunRoot = null;
let vfxGunLine = null;
let vfxGunTip = null;
let vfxGunMaterial = null;
let vfxGunRaycast = null;
let vfxGunRaycastMode = "";
let vfxGunRaycastReady = false;
let vfxGunRaycastHitBuffer = null;
let vfxGunRaycastHitRef = null;
let vfxGunBoundRpc = null;
let vfxGunRpcPlayer = null;
let vfxGunLastStartPosition = null;
let vfxGunLastEndPosition = null;
let vfxNameResolver = null;
let vfxNameResolverLastScan = -1000.0;
let tpAllCooldownUntil = 0.0;
let lastRigSpamAt = 0.0;
let rigSpamObjects = [];
let rigSpamSpawnMethod = null;
let rigSpamDespawnMethod = null;
let lastTitleSpamAt = -1000.0;
let titleSpamIndex = 0;
let titleSystemClass = null;
let titleSystemResolved = false;
let titleNameTagTarget = null;
let titleNameTagSpawner = null;
let titleOriginalRankText = "";
let titleOriginalNetworkXp = null;
let titleNetworkPlayer = null;
let activeTemporaryTitleLevel = 0;
const titleXpByLevel = new Map();
let titleSpawnFallbackAt = -1000.0;
let titleNextErrorAt = -1000.0;
let activeTemporaryTitleText = "";
let titleStickyRefreshFrame = -1000;
let rigSpamAvatarPrefabState = null;
let rigSpamLastError = "";
let rigSpamNextErrorAt = -1000.0;
let rigSpamVisibleLayer = null;
let rigSpamIdentitySequence = 1;
let aimbotTarget = null;
let aimbotTargetRefreshFrame = -1000;
let aimbotTargetPoint = null;
let aimbotTargetPointFrame = -1000;
let aimbotVisualRefreshFrame = -1000;
let heldWeaponsCacheFrame = -1000;
let heldWeaponsCache = [];
const aimbotAimTransformCache = new Map();
const teamKeyCache = new Map();
let lobbyWeaponDamageGateState = null;
let rigSpinYaw = 0.0;
let rigSpinState = null;
let rigSpinStateSnapshot = null;
let rigSpinTargets = null;
let rigSpinCurrentSpeed = 1;
let rigSpinNextWarningAt = -1000.0;
let originalRigHitboxes = new Map();
let extendHitboxNextRefreshFrame = -1000;
let hitboxLayerIndexCache = null;
let hitboxVisuals = new Map();
let hitboxVisualRescanFrame = -1000;
let removeStreakLastAttempt = 0.0;
let vfxGunNextPlayerLookupAt = -1000.0;
let vfxGunVisualRetryAt = -1000.0;
let vfxGunNextShotAt = -1000.0;
let vfxGunDispatchUnavailableUntil = -1000.0;
let vfxGunFailureCount = 0;
let vfxGunNextErrorLogAt = -1000.0;
let lastTickError = "";
let tickErrorCount = 0;
let activeLocalPlayer = null;
let menuBuildFaulted = false;
let menuRetryFrame = 0;
let menuTextFaultLogged = false;
let menuRoundedMeshFaultLogged = false;
let visualRoot = null;
let visualTargets = new Map();
let visualShader = null;
let visualMaterials = new Map();
let visualHpMaterial = null;
let lastVisualScanFrame = -1000;
let lastMatchModeScanFrame = -1000;
let chamScanCursor = 0;
let cachedMatchModeActive = false;
let discoveredTeamGetterNames = null;
let discoveredTeamFieldNames = null;
let discoveredVisualRootFieldNames = null;
let discoveredMovementBoostFieldNames = null;
let discoveredMovementComponentFieldNames = null;
let cachedHealthValueAccessor = null;
let invisibilityPlayer = null;
let invisibleRenderers = new Map();
let lastInvisibilityScanFrame = -1000;
let invisibilityLayerRpcPlayer = null;
let invisibilityOriginalLayer = -1;
let invisibilityLayerRpcApplied = false;
let longArmState = null;
let joystickFlyState = null;
let speedBoostPlayer = null;
let speedBoostController = null;
let speedBoostOriginalVelocityCap = null;
let speedBoostOriginalMovementValues = null;
let speedBoostTouchedMovementValues = [];
let speedBoostLeftApplied = false;
let speedBoostRightApplied = false;
let lastLocalControllerTickAt = 0;
let lastLocalControllerValidationAt = 0;
let localControllerFocusPoll = 0;
let cachedApplicationFocused = true;
let focusCleanupPending = false;
let focusLostFrameCount = 0;
let menuWasOpen = false;
let tickInProgress = false;
const lastOverpoweredActionAt = new Map();
Il2Cpp.perform(() => {
    const Core = Il2Cpp.domain.assembly("UnityEngine.CoreModule").image;
    const PhysicsImage = Il2Cpp.domain.assembly("UnityEngine.PhysicsModule").image;
    const TextImage = Il2Cpp.domain.assembly("UnityEngine.TextRenderingModule").image;
    const XRImage = Il2Cpp.domain.assembly("UnityEngine.XRModule").image;
    const AudioImage = Il2Cpp.domain.assembly("UnityEngine.AudioModule").image;
    const Game = Il2Cpp.domain.assembly("DL.Animals.Core2025").image;
    const FusionRuntime = (() => {
        try {
            return Il2Cpp.domain.assembly("Fusion.Runtime").image;
        }
        catch (_) {
            return null;
        }
    })();
    const FusionNetworkObject = FusionRuntime ? FusionRuntime.class("Fusion.NetworkObject") : null;
    const FusionNetworkRunner = FusionRuntime ? FusionRuntime.class("Fusion.NetworkRunner") : null;
    const FusionNetworkTransform = FusionRuntime ? FusionRuntime.class("Fusion.NetworkTransform") : null;
    const AvatarBehaviourFusion = (() => {
        const fullName = "Meta.XR.MultiplayerBlocks.Fusion.AvatarBehaviourFusion";
        for (const assemblyName of [
            "Meta.XR.MultiplayerBlocks.Fusion",
            "Meta.XR.MultiplayerBlocks.Fusion.Runtime",
            "Meta.XR.MultiplayerBlocks",
        ]) {
            try {
                return Il2Cpp.domain.assembly(assemblyName).image.class(fullName);
            }
            catch (_) { }
        }
        try {
            for (const assembly of Il2Cpp.domain.assemblies) {
                try {
                    return assembly.image.class(fullName);
                }
                catch (_) { }
            }
        }
        catch (_) { }
        return null;
    })();
    const AssemblyCSharp = (() => {
        try {
            return Il2Cpp.domain.assembly("Assembly-CSharp").image;
        }
        catch (_) {
            return null;
        }
    })();
    const GameObject = Core.class("UnityEngine.GameObject");
    const Mesh = Core.class("UnityEngine.Mesh");
    const MeshFilter = Core.class("UnityEngine.MeshFilter");
    const UnityObject = Core.class("UnityEngine.Object");
    const Renderer = Core.class("UnityEngine.Renderer");
    const MeshRenderer = Core.class("UnityEngine.MeshRenderer");
    const SkinnedMeshRenderer = Core.class("UnityEngine.SkinnedMeshRenderer");
    const LineRenderer = Core.class("UnityEngine.LineRenderer");
    const Material = Core.class("UnityEngine.Material");
    const Resources = Core.class("UnityEngine.Resources");
    const Camera = Core.class("UnityEngine.Camera");
    const Application = Core.class("UnityEngine.Application");
    const Time = Core.class("UnityEngine.Time");
    const Quaternion = Core.class("UnityEngine.Quaternion");
    const LayerMask = Core.class("UnityEngine.LayerMask");
    const Shader = Core.class("UnityEngine.Shader");
    const Vector3 = Core.class("UnityEngine.Vector3");
    const Color = Core.class("UnityEngine.Color");
    const Physics = PhysicsImage.class("UnityEngine.Physics");
    const Collider = PhysicsImage.class("UnityEngine.Collider");
    const Rigidbody = PhysicsImage.class("UnityEngine.Rigidbody");
    const TextMesh = TextImage.class("UnityEngine.TextMesh");
    const Font = TextImage.class("UnityEngine.Font");
    const InputDevices = XRImage.class("UnityEngine.XR.InputDevices");
    const CommonUsages = XRImage.class("UnityEngine.XR.CommonUsages");
    const AudioClip = AudioImage.class("UnityEngine.AudioClip");
    const AudioSource = AudioImage.class("UnityEngine.AudioSource");
    const SingleClass = Il2Cpp.corlib.class("System.Single");
    const ShortClass = Il2Cpp.corlib.class("System.Int16");
    let PhotonRecorder = null;
    let PhotonVoiceConnection = null;
    let PhotonVoiceImage = null;
    let PhotonVoiceCoreImage = null;
    let CustomVoiceRecorder = null;
    try {
        PhotonVoiceImage = Il2Cpp.domain.assembly("PhotonVoice").image;
        PhotonRecorder = PhotonVoiceImage.class("Photon.Voice.Unity.Recorder");
        PhotonVoiceConnection = PhotonVoiceImage.class("Photon.Voice.Unity.VoiceConnection");
    }
    catch (_) { }
    for (const assemblyName of ["PhotonVoice.API", "PhotonVoiceApi", "PhotonVoice"]) {
        try {
            const image = Il2Cpp.domain.assembly(assemblyName).image;
            image.class("Photon.Voice.LocalVoiceAudioShort");
            PhotonVoiceCoreImage = image;
            break;
        }
        catch (_) { }
    }
    try {
        CustomVoiceRecorder = Game.class("CustomVoiceRecorder");
    }
    catch (_) { }
    const WeaponBase = Game.class("DLAR_WeaponBase");
    const HitscanWeapon = Game.class("HitscanWeapon");
    const ProjectileWeapon = Game.class("ProjectileWeapon");
    const projectileLaunchMethod = (() => {
        for (const parameterCount of [3, 2]) {
            try {
                return ProjectileWeapon.method("LaunchProjectile", parameterCount);
            }
            catch (_) { }
        }
        return null;
    })();
    const AmmoStorage = Game.class("Weapons.WeaponAmmoStorage");
    const CooldownManager = Game.class("WeaponFireRateCooldownManager");
    const RecoilController = Game.class("DLAR_XRHandRecoilController");
    const PlayerController = Game.class("PlayerController");
    function resolveClass(className) {
        if (!className)
            return null;
        try {
            return AssemblyCSharp ? AssemblyCSharp.class(className) : null;
        }
        catch (_) { }
        try {
            return Game.class(className);
        }
        catch (_) { }
        return null;
    }
    function resolveClassAnywhere(className) {
        if (!className)
            return null;
        try {
            for (const assembly of Il2Cpp.domain.assemblies) {
                try {
                    const klass = assembly.image.class(className);
                    if (klass)
                        return klass;
                }
                catch (_) { }
            }
        }
        catch (_) { }
        return null;
    }
    function hookBooleanAccessor(className, methodName, replacementValue = false) {
        const klass = resolveClass(className);
        if (!klass)
            return;
        let methods = [];
        try {
            methods.push(klass.method(methodName, 0));
        }
        catch (_) { }
        try {
            methods = methods.concat((klass.methods || [])
                .filter((method) => method.name === methodName && method.parameterCount === 0));
        }
        catch (_) { }
        for (const method of methods) {
            try {
                if (method.returnType.name !== "System.Boolean" || method.virtualAddress.isNull()) {
                    continue;
                }
                if (method.isGeneric || method.isInflated)
                    continue;
                installHook(method, `${className}.${methodName}`, function () {
                    return !!replacementValue;
                });
                break;
            }
            catch (_) { }
        }
    }
    function hookNoopVoid(className, methodName) {
        const klass = resolveClass(className);
        if (!klass)
            return;
        let methods = [];
        try {
            methods.push(klass.method(methodName, 0));
        }
        catch (_) { }
        try {
            methods = methods.concat((klass.methods || [])
                .filter((method) => method.name === methodName && method.parameterCount === 0));
        }
        catch (_) { }
        for (const method of methods) {
            try {
                if (method.returnType.name !== "System.Void" || method.virtualAddress.isNull()) {
                    continue;
                }
                if (method.isGeneric || method.isInflated)
                    continue;
                installHook(method, `${className}.${methodName}`, function () {
                    return;
                });
                break;
            }
            catch (_) { }
        }
    }
    function installAntiCheatBypasses() {
        try {
            hookBooleanAccessor("GUPS.AntiCheat.Punisher.ExitGamePunisher", "get_IsSupported");
            hookBooleanAccessor("GUPS.AntiCheat.Punisher.ExitGamePunisher", "get_IsActive");
            hookBooleanAccessor("GUPS.AntiCheat.Punisher.ExitGamePunisher", "get_PunishOnce");
            hookBooleanAccessor("GUPS.AntiCheat.Punisher.ExitGamePunisher", "get_HasPunished");
            // This accessor is phrased positively: true means the scene/lifecycle
            // guard must be ignored. Returning false here did the opposite of the
            // intended bypass and let a room transition re-arm the tamper path.
            hookBooleanAccessor("AntiCheatRuntimeGuards", "get_ShouldIgnoreTamperCheck", true);
            hookBooleanAccessor("AntiCheatValueDetector", "get_UseUpdateLoop");
            hookBooleanAccessor("AntiCheatValueDetector", "ShouldEvaluateThisFrame");
            hookNoopVoid("GUPS.AntiCheat.Punisher.ExitGamePunisher", "Punish");
            hookNoopVoid("GUPS.AntiCheat.Punisher.ExitGamePunisher", "OnTemperingDetected");
            hookNoopVoid("AntiCheatManager", "RegisterDetector");
            hookNoopVoid("AntiCheatManager", "HandleDetectorLifecycleTamper");
            hookNoopVoid("AntiCheatManager", "HandleDetectorValueTamper");
            hookNoopVoid("AntiCheatManager", "OnTemperingDetected");
            hookNoopVoid("AntiCheatManager", "add_TamperDetected");
            hookNoopVoid("AntiCheatManager", "TriggerTamper");
            hookNoopVoid("AntiCheatManager", "ReportTamper");
            hookNoopVoid("AntiCheatManager", "DelayedLifecycleEvaluation");
            // Leave OnApplicationQuitting intact. It performs legitimate static
            // cleanup too; suppressing it made Android wait for the activity's
            // destroy timeout whenever the user closed a stuck game.
            hookNoopVoid("AntiCheatRuntimeGuards", "RunAfterDelay");
            hookNoopVoid("AntiCheatRuntimeGuards", "ArmSceneGuard");
            hookNoopVoid("AntiCheatRuntimeGuards", "Initialize");
            hookNoopVoid("AntiCheatValueDetector", "AttachToManager");
            hookNoopVoid("AntiCheatValueDetector", "get_DetectorName");
            hookNoopVoid("AntiCheatValueDetector", "TryReadValue");
            hookNoopVoid("AntiCheatValueDetector", "EvaluateLifecycleTamper");
            hookNoopVoid("AntiCheatValueDetector", "ReportValueTamper");
            hookNoopVoid("GUPSLibraryTamperReporter", "OnAndroidCheatingDetected");
            console.log("[" + MENU_NAME + "] Anti-cheat methods patched.");
        }
        catch (_) {
            console.error("[" + MENU_NAME + "] Anti-cheat patching unavailable.");
        }
    }
    installAntiCheatBypasses();
    function optionalGameClass(name) {
        try {
            return Game.class(name);
        }
        catch (_) {
            return null;
        }
    }
    // These exact classes are present in the pinned build. Keep them optional
    // so a missing subsystem disables only its unlock coverage, not the menu.
    const UITechNode = optionalGameClass("UITechNode");
    const UITouchCosmeticSelection = optionalGameClass("UITouchCosmeticSelection");
    const UITouchWeaponSelection = optionalGameClass("UITouchWeaponSelection");
    const UIPanelLoadout = optionalGameClass("UIPanelLoadout");
    const UIPanelWeaponSkins = optionalGameClass("UIPanelWeaponSkins");
    const PlayerCosmeticsLockerPanel = optionalGameClass("PlayerCosmeticsLockerPanel");
    const PlayfabItem = optionalGameClass("PlayfabItem");
    const MannequinLockerManager = optionalGameClass("MannequinLockerManager");
    const WeaponSkins = optionalGameClass("WeaponSkins");
    const WeaponsManager = optionalGameClass("WeaponsManager");
    const PlayFabManagerClient = optionalGameClass("DL.Networking.DLPlayFabManagerClient");
    const TechNodeWeaponWrap = optionalGameClass("TechNodeWeaponWrap");
    const ScriptableWeaponList = optionalGameClass("ScriptableWeaponList");
    const ClipboardWeapon = optionalGameClass("ClipboardWeapon");
    const NetworkPlayer = optionalGameClass("DLARX_NetworkPlayer");
    const NetworkNpcAgent = optionalGameClass("NetworkNpcAgent");
    let cachedBots = [], nextBotScanFrame = -1;
    const botAimTransforms = new Map();
    function isBot(target) {
        return !!target && String(target.class?.name || "") === "NetworkNpcAgent";
    }
    function botIsAlive(target) {
        if (!isUnityObjectAlive(target) || !componentIsActiveInScene(target)) return false;
        try { return !target.method("get_IsDead", 0).invoke(); }
        catch (_) { return false; }
    }
    function activeBots() {
        if (!NetworkNpcAgent) return [];
        if (frameNumber >= nextBotScanFrame) {
            nextBotScanFrame = frameNumber + AIMBOT_TARGET_REFRESH_FRAMES;
            cachedBots = objectsOfClass(NetworkNpcAgent).filter(botIsAlive);
            const keys = new Set(cachedBots.map(visualObjectKey));
            for (const key of botAimTransforms.keys()) if (!keys.has(key)) botAimTransforms.delete(key);
        }
        return cachedBots.filter(botIsAlive);
    }
    function botRoots(target) {
        const roots = [componentGameObject(target)];
        try { roots.push(hierarchyGameObject(target.field("movementRoot").value)); } catch (_) {}
        try {
            const proxy = target.field("visualProxy").value;
            if (isUnityObjectAlive(proxy)) roots.push(hierarchyGameObject(proxy.field("targetTransform").value));
        } catch (_) {}
        return roots.filter((root, index) => isUnityObjectAlive(root) && roots.findIndex(other => sameObject(other, root)) === index);
    }
    function botAimPosition(target) {
        if (!botIsAlive(target)) return null;
        const key = visualObjectKey(target);
        let anchor = botAimTransforms.get(key);
        if (!isUnityObjectAlive(anchor)) {
            try {
                const receiver = target.method("get_DamageReceiver", 0).invoke();
                const boxes = objectArrayValues(receiver.method("get_HitBoxes", 0).invoke());
                const box = boxes.find(value => isUnityObjectAlive(value) && !!value.field("isHead").value) || boxes.find(isUnityObjectAlive);
                if (box) anchor = getTransform(box);
            } catch (_) {}
            if (isUnityObjectAlive(anchor)) botAimTransforms.set(key, anchor);
        }
        if (isUnityObjectAlive(anchor)) return transformPosition(anchor);
        try { return transformPosition(getTransform(target)); } catch (_) { return null; }
    }
    const NetworkRig = optionalGameClass("NetworkRig");
    const NetworkLocalAvatar = optionalGameClass("NetworkLocalAvatar");
    const VfxsManager = resolveClass("VfxsManager");
    const PlayerGlider = optionalGameClass("PlayerGlider");
    const AdminTeleport = optionalGameClass("AdminTeleport");
    const GrenadeLauncher = optionalGameClass("GrenadeLauncher");
    const GrenadeProjectile = optionalGameClass("Deadeye.Throwables.GrenadeProjectile");
    const GorillaMovement = optionalGameClass("GorillaMovement");
    const MovementManager = optionalGameClass("MovementManager");
    const PlayerVoiceHandler = optionalGameClass("CustomVoiceRecorder");
    const ARProgressionManager = optionalGameClass("ARProgressionManager");
    const GradientPalette = resolveClassAnywhere("_DogeLabs.DogeBackend.Progression.GradientPalette");
    const VertexGradient = resolveClassAnywhere("TMPro.VertexGradient");
    const MatchModeClasses = [
        "GameActivity_TeamDeathMatch",
        "Duels.GameActivity_Duels",
        "Duels.GameActivity_DuelsV2",
        "Systems.GameActivities.CTF.GameActivity_CTF",
        "Infected.GameActivity_Infected",
        "GameActivity_Extraction",
        "BattleRoyaleLiteActivity",
    ].map(optionalGameClass).filter(Boolean);
    // Unity 6's private identityQuaternion backing field can expose invalid
    // metadata through IL2CPP; the public Euler factory returns the same value.
    const identityQuaternion = Quaternion.method("Euler", 3).invoke(0, 0, 0);
    let menuSurfaceShader = null;
    const roundedMeshCache = new Map();
    const menuMaterials = new Map();
    const unlockViewFieldState = new Map();
    const unlockWeaponListAdditions = [];
    const unlockWeaponArrayOverrides = new Map();
    let soundboardRecorder = null;
    let soundboardCustomVoiceRecorder = null;
    let soundboardRecorderState = null;
    let soundboardMicRouted = false;
    let currentSoundClip = null;
    let soundboardEndTime = 0.0;
    let soundboardTransmitCheckAt = 0.0;
    let soundboardTransmitRetries = 0;
    let pendingWavDecode = null;
    inputOutBool = Il2Cpp.alloc(1);
    inputOutVector2 = Il2Cpp.alloc(8);
    function isLive(value) {
        if (!value)
            return false;
        try {
            return !value.isNull();
        }
        catch (_) {
            return false;
        }
    }
    function isUnityObjectAlive(value) {
        if (!isLive(value))
            return false;
        try {
            return !!UnityObject.method("op_Implicit", 1).invoke(value);
        }
        catch (_) {
            return false;
        }
    }
    function destroy(value) {
        if (!isLive(value))
            return;
        try {
            UnityObject.method("Destroy", 1).invoke(value);
        }
        catch (_) { }
    }
    function getTransform(value) {
        return value.method("get_transform", 0).invoke();
    }
    function getComponent(value, klass) {
        try {
            return value.method("GetComponent", 1)
                .overload("System.Type")
                .invoke(klass.type.object);
        }
        catch (_) {
            return null;
        }
    }
    function addComponent(value, klass) {
        try {
            value.method("Internal_AddComponentWithType", 1).invoke(klass.type.object);
            const component = getComponent(value, klass);
            if (isLive(component))
                return component;
        }
        catch (_) { }
        value.method("AddComponent", 1)
            .overload("System.Type")
            .invoke(klass.type.object);
        return getComponent(value, klass);
    }
    function setName(value, name) {
        try {
            value.method("set_name", 1).invoke(Il2Cpp.string(name));
        }
        catch (_) { }
    }
    function createEmpty(name) {
        const object = GameObject.alloc();
        try {
            object.method(".ctor", 1).invoke(Il2Cpp.string(name));
        }
        catch (_) {
            object.method(".ctor", 0).invoke();
            setName(object, name);
        }
        return object;
    }
    function getMenuSurfaceShader() {
        if (isUnityObjectAlive(menuSurfaceShader))
            return menuSurfaceShader;
        menuSurfaceShader = null;
        for (const shaderName of [
            "Universal Render Pipeline/Unlit",
            "Unlit/Color",
            "UI/Default",
        ]) {
            try {
                const candidate = Shader.method("Find", 1).invoke(Il2Cpp.string(shaderName));
                if (isLive(candidate)) {
                    menuSurfaceShader = candidate;
                    return menuSurfaceShader;
                }
            }
            catch (_) { }
        }
        return null;
    }
    function setRendererColor(renderer, color) {
        if (!isLive(renderer))
            return;
        try {
            renderer.method("set_enabled", 1).invoke(true);
            const material = renderer.method("get_material", 0).invoke();
            if (!isLive(material))
                return;
            try {
                menuMaterials.set(String(material.handle), material);
            }
            catch (_) { }
            const shader = getMenuSurfaceShader();
            if (isLive(shader))
                material.method("set_shader", 1).invoke(shader);
            material.method("set_color", 1).invoke(color);
            try {
                material.method("SetColor", 2)
                    .overload("System.String", "UnityEngine.Color")
                    .invoke(Il2Cpp.string("_BaseColor"), color);
            }
            catch (_) { }
        }
        catch (_) { }
    }
    function createCube(name, parent, position, localScale, color, keepTriggerCollider) {
        const object = GameObject.method("CreatePrimitive", 1).invoke(3);
        setName(object, name);
        const transform = getTransform(object);
        transform.method("SetParent", 2).invoke(parent, false);
        // The UNOBF menu authors these values in world space before attaching the root.
        transform.method("set_position", 1).invoke(position);
        transform.method("set_rotation", 1).invoke(identityQuaternion);
        transform.method("set_localScale", 1).invoke(localScale);
        const renderer = getComponent(object, Renderer);
        setRendererColor(renderer, color);
        const collider = getComponent(object, Collider);
        if (isLive(collider)) {
            if (keepTriggerCollider) {
                try {
                    collider.method("set_enabled", 1).invoke(true);
                }
                catch (_) { }
                try {
                    collider.method("set_isTrigger", 1).invoke(true);
                }
                catch (_) { }
            }
            else {
                try {
                    collider.method("set_enabled", 1).invoke(false);
                }
                catch (_) {
                    destroy(collider);
                }
            }
        }
        return { object, renderer };
    }
    function getRoundedBoxMesh(width, height, cornerRadius) {
        const normalizedY = Math.max(0.001, Math.min(0.46, cornerRadius / Math.max(width, 0.001)));
        const normalizedZ = Math.max(0.001, Math.min(0.46, cornerRadius / Math.max(height, 0.001)));
        const cacheKey = normalizedY.toFixed(4) + ":" + normalizedZ.toFixed(4);
        const cached = roundedMeshCache.get(cacheKey);
        if (isUnityObjectAlive(cached))
            return cached;
        roundedMeshCache.delete(cacheKey);
        const perimeter = [];
        const cornerSegments = 10;
        const corners = [
            [0.5 - normalizedY, 0.5 - normalizedZ, 0, Math.PI * 0.5],
            [-0.5 + normalizedY, 0.5 - normalizedZ, Math.PI * 0.5, Math.PI],
            [-0.5 + normalizedY, -0.5 + normalizedZ, Math.PI, Math.PI * 1.5],
            [0.5 - normalizedY, -0.5 + normalizedZ, Math.PI * 1.5, Math.PI * 2],
        ];
        for (const [centerY, centerZ, startAngle, endAngle] of corners) {
            for (let segment = 0; segment <= cornerSegments; segment++) {
                const t = segment / cornerSegments;
                const angle = startAngle + (endAngle - startAngle) * t;
                perimeter.push([
                    centerY + Math.cos(angle) * normalizedY,
                    centerZ + Math.sin(angle) * normalizedZ,
                ]);
            }
        }
        const vertices = [];
        for (const [y, z] of perimeter)
            vertices.push([0.5, y, z]);
        for (const [y, z] of perimeter)
            vertices.push([-0.5, y, z]);
        const ringCount = perimeter.length;
        const frontCenter = vertices.length;
        vertices.push([0.5, 0, 0]);
        const backCenter = vertices.length;
        vertices.push([-0.5, 0, 0]);
        const triangles = [];
        for (let index = 0; index < ringCount; index++) {
            const next = (index + 1) % ringCount;
            triangles.push(frontCenter, index, next);
            triangles.push(backCenter, next + ringCount, index + ringCount);
            triangles.push(index, index + ringCount, next + ringCount);
            triangles.push(index, next + ringCount, next);
        }
        const vertexArray = Il2Cpp.array(Vector3, vertices.length);
        for (let index = 0; index < vertices.length; index++) {
            vertexArray.set(index, Il2Cpp.fromFridaValue(vertices[index], Vector3.type));
        }
        const mesh = Mesh.alloc();
        mesh.method(".ctor", 0).invoke();
        mesh.method("set_vertices", 1).invoke(vertexArray);
        mesh.method("set_triangles", 1)
            .invoke(Il2Cpp.array(Il2Cpp.corlib.class("System.Int32"), triangles));
        try {
            mesh.method("RecalculateBounds", 0).invoke();
        }
        catch (_) { }
        try {
            mesh.method("RecalculateNormals", 0).invoke();
        }
        catch (_) { }
        const vertexCount = Number(mesh.method("get_vertexCount", 0).invoke());
        if (!Number.isFinite(vertexCount) || vertexCount <= 0) {
            throw new Error("Rounded menu mesh has no vertices");
        }
        roundedMeshCache.set(cacheKey, mesh);
        return mesh;
    }
    function clearRoundedMeshCache() {
        const meshes = Array.from(roundedMeshCache.values());
        roundedMeshCache.clear();
        for (const mesh of meshes) {
            if (!isUnityObjectAlive(mesh))
                continue;
            try {
                UnityObject.method("Destroy", 1).invoke(mesh);
            }
            catch (_) { }
        }
    }
    function setRoundedMesh(surfaceObject, width, height, cornerRadius) {
        // Runtime-generated Mesh wrappers became stale across Quest scene/menu
        // teardown and faulted inside MeshFilter setters. Rounded corners are
        // cosmetic, so retain CreatePrimitive's stable built-in cube mesh.
        void surfaceObject;
        void width;
        void height;
        void cornerRadius;
    }
    function createOutlinedObject(name, parent, position, scale, color, interactive, outlineSize) {
        const fill = createCube(name, parent, position, scale, color, interactive);
        const fillRadius = Math.min(Math.min(scale[1], scale[2]) * 0.28, 0.06);
        setRoundedMesh(fill.object, scale[1], scale[2], fillRadius);
        if (outlineSize > 0) {
            const outlineScale = [
                scale[0],
                scale[1] + outlineSize * 2,
                scale[2] + outlineSize * 2,
            ];
            const outline = createCube(name + ":Outline", parent, [position[0] - 0.001, position[1], position[2]], outlineScale, COLORS.outline, false);
            setRoundedMesh(outline.object, outlineScale[1], outlineScale[2], fillRadius + outlineSize);
        }
        return fill;
    }
    function getFont() {
        if (isUnityObjectAlive(menuFont))
            return menuFont;
        menuFont = null;
        for (const fileName of ["LegacyRuntime.ttf", "Arial.ttf"]) {
            try {
                const candidate = Resources.method("GetBuiltinResource", 2)
                    .overload("System.Type", "System.String")
                    .invoke(Font.type.object, Il2Cpp.string(fileName));
                if (isLive(candidate)) {
                    menuFont = candidate;
                    return menuFont;
                }
            }
            catch (_) { }
        }
        return null;
    }
    function setMenuTextScale(textTransform, baseScale) {
        try {
            const rootScale = getTransform(menuRoot).method("get_localScale", 0).invoke();
            const sx = Math.abs(Number(rootScale.field("x").value)) || 1.0;
            const sy = Math.abs(Number(rootScale.field("y").value)) || 1.0;
            const sz = Math.abs(Number(rootScale.field("z").value)) || 1.0;
            const xScale = (baseScale * 0.42) / sx;
            textTransform.method("set_localScale", 1).invoke([-xScale, baseScale / sy, baseScale / sz]);
        }
        catch (_) {
            try {
                textTransform.method("set_localScale", 1).invoke([-(baseScale * 0.42), baseScale, baseScale]);
            }
            catch (_) { }
        }
    }
    function createText(parent, surfaceObject, name, text, surfacePosition, color, fontSize, characterSize, baseScale) {
        let object = null;
        try {
            object = createEmpty(name);
            const transform = getTransform(object);
            transform.method("SetParent", 2).invoke(parent, false);
            const component = addComponent(object, TextMesh);
            if (!isLive(component))
                throw new Error("TextMesh was not created");
            const font = getFont();
            if (isLive(font)) {
                try {
                    component.method("set_font", 1).invoke(font);
                }
                catch (_) { }
                try {
                    const textRenderer = getComponent(object, Renderer);
                    const fontMaterial = font.method("get_material", 0).invoke();
                    if (isLive(textRenderer) && isLive(fontMaterial)) {
                        try {
                            textRenderer.method("set_sharedMaterial", 1).invoke(fontMaterial);
                        }
                        catch (_) {
                            textRenderer.method("set_material", 1).invoke(fontMaterial);
                        }
                    }
                }
                catch (_) { }
            }
            component.method("set_text", 1).invoke(Il2Cpp.string(text));
            try {
                component.method("set_fontSize", 1).invoke(fontSize);
            }
            catch (_) { }
            try {
                component.method("set_characterSize", 1).invoke(characterSize);
            }
            catch (_) { }
            try {
                component.method("set_fontStyle", 1).invoke(1);
            }
            catch (_) { }
            try {
                component.method("set_anchor", 1).invoke(4);
            }
            catch (_) { }
            try {
                component.method("set_alignment", 1).invoke(1);
            }
            catch (_) { }
            try {
                component.method("set_richText", 1).invoke(true);
            }
            catch (_) { }
            try {
                component.method("set_color", 1).invoke(color);
            }
            catch (_) { }
            try {
                const anchorPosition = [surfacePosition[0] + 0.0125, surfacePosition[1], surfacePosition[2]];
                transform.method("set_position", 1).invoke(getTransform(surfaceObject).method("TransformPoint", 1).invoke(anchorPosition));
            }
            catch (_) {
                try {
                    transform.method("set_localPosition", 1).invoke(surfacePosition);
                }
                catch (_) { }
            }
            try {
                const surfaceRotation = getTransform(surfaceObject).method("get_rotation", 0).invoke();
                const faceRotation = Quaternion.method("op_Multiply", 2).invoke(surfaceRotation, Quaternion.method("Euler", 3).invoke(0, 90, 90));
                transform.method("set_rotation", 1).invoke(faceRotation);
            }
            catch (_) {
                try {
                    transform.method("set_localRotation", 1)
                        .invoke(Quaternion.method("Euler", 3).invoke(0, 90, 90));
                }
                catch (_) { }
            }
            setMenuTextScale(transform, baseScale);
            try {
                const textRenderer = getComponent(object, Renderer);
                if (isLive(textRenderer)) {
                    textRenderer.method("set_enabled", 1).invoke(menuTextFrontVisible);
                    try {
                        textRenderer.method("set_sortingOrder", 1).invoke(32767);
                    }
                    catch (_) { }
                    menuTextRenderers.push(textRenderer);
                }
            }
            catch (_) { }
            return component;
        }
        catch (error) {
            if (isLive(object))
                destroy(object);
            if (!menuTextFaultLogged) {
                menuTextFaultLogged = true;
                console.error("[" + MENU_NAME + "] Text skipped without closing the menu: " + error);
            }
            return null;
        }
    }
    function getCurrentGrenadeVariant() {
        return GRENADE_VARIANTS[selectedGrenadeVariant];
    }
    function cycleGrenadeVariant(delta) {
        const variantCount = GRENADE_VARIANTS.length;
        if (!variantCount)
            return;
        selectedGrenadeVariant = (selectedGrenadeVariant + delta + variantCount) % variantCount;
        cachedGrenadePrefab = null;
        cachedGrenadePrefabVariant = -1;
        grenadePrefabRetryAt = -1000.0;
        console.log("[" + MENU_NAME + "] Grenade variant: " + getCurrentGrenadeVariant().name);
    }
    function menuEntries() {
        if (currentCategory === "Main") {
            return [
                { id: "category-movement", label: "Movement", category: "Movement" },
                { id: "category-weapons", label: "Weapons", category: "Weapons" },
                { id: "category-overpowered", label: "Overpowered", category: "Overpowered" },
                { id: "category-visuals", label: "Visuals", category: "Visuals" },
                { id: "category-spawning", label: "Spawning", category: "Spawning" },
                { id: "category-rig", label: "Rig", category: "Rig" },
                { id: "category-titles", label: "Titles", category: "Titles" },
                { id: "category-soundboard", label: "Soundboard", category: "Soundboard" },
            ];
        }
        if (currentCategory === "Movement") {
            return [
                { id: "trigger-fly", label: "Trigger Fly", toggle: "triggerFly" },
                { id: "joystick-fly", label: "Joystick Fly", toggle: "joystickFly" },
                { id: "speed-boost", label: "Speed Boost", toggle: "speedBoost" },
                { id: "long-arms", label: "Long Arms", toggle: "longArms" },
                { id: "platforms", label: "Platforms", toggle: "platforms" },
                { id: "back-movement", label: "< Back", back: true },
            ];
        }
        if (currentCategory === "Weapons") {
            return [
                { id: "infinite-ammo", label: "Infinite Ammo", toggle: "infiniteAmmo" },
                { id: "no-cooldown", label: "No Cooldown", toggle: "noCooldown" },
                { id: "rapid-fire", label: "Rapid Fire", toggle: "rapidFire" },
                { id: "no-recoil", label: "No Recoil", toggle: "noRecoil" },
                { id: "aimbot", label: "Aimbot", toggle: "aimbot" },
                { id: "grenade-launcher", label: "Grenade Launcher", toggle: "grenadeLauncher" },
                { id: "grenade-variant", label: "Grenade: " + getCurrentGrenadeVariant().name, grenadeSelector: true },
                { id: "dump-throwables", label: "Dump Throwables", action: "dumpThrowables" },
                { id: "kill-in-lobby", label: "Kill in Lobby", toggle: "killInLobby" },
                { id: "use-guns-in-lobby", label: "Use Guns in Lobby", toggle: "useGunsInLobby" },
                { id: "back-weapons", label: "< Back", back: true },
            ];
        }
        if (currentCategory === "Overpowered") {
            return [
                { id: "invincibility", label: "Invincibility", toggle: "invincibility" },
                { id: "invisibility", label: "Invisibility", toggle: "invisibility" },
                { id: "extend-hitboxes", label: "Extend Hitboxes", toggle: "extendHitboxes" },
                { id: "unlock-all", label: "Unlock All", toggle: "unlockAll" },
                { id: "tp-all", label: "TP All", action: "tpAll" },
                { id: "kill-all", label: "Kill All", action: "killAll" },
                { id: "nuke", label: "Nuke", action: "nuke" },
                { id: "remove-streak-gun", label: "Remove Streak Gun", toggle: "removeStreakGun" },
                { id: "back-overpowered", label: "< Back", back: true },
            ];
        }
        if (currentCategory === "Visuals") {
            return [
                { id: "tracers", label: "Tracers", toggle: "tracers" },
                { id: "chams", label: "Chams", toggle: "chams" },
                { id: "show-hp", label: "Show HP", toggle: "showHp" },
                { id: "show-hitboxes", label: "Show Hitboxes", toggle: "showHitboxes" },
                { id: "back-visuals", label: "< Back", back: true },
            ];
        }
        if (currentCategory === "Spawning") {
            ensureSpawnPrefabCatalog();
            const selected = selectedSpawnPrefabEntry();
            return [
                { id: "spawn-gun", label: "Spawn Gun", toggle: "vfxGun" },
                {
                    id: "spawn-selected",
                    label: "Selected: " + selected.name,
                    disabled: true,
                },
                { id: "prefab-list", label: "Prefab List (" + spawnPrefabCatalog.length + ")", category: "Prefab List" },
                { id: "prefab-refresh", label: "Redump Prefabs", prefabRefresh: true },
                { id: "back-spawning", label: "< Back", back: true },
            ];
        }
        if (currentCategory === "Prefab List") {
            ensureSpawnPrefabCatalog();
            const entries = [
                { id: "back-prefab-list", label: "< Back to Spawning", back: true, backCategory: "Spawning" },
                { id: "prefab-refresh-list", label: "Refresh + Dump", prefabRefresh: true },
            ];
            spawnPrefabCatalog.forEach((prefab, index) => {
                entries.push({
                    id: "spawn-prefab-" + index,
                    label: (index === selectedSpawnPrefabIndex ? "* " : "") +
                        "[" + prefab.kind.toUpperCase() + "] " + prefab.name,
                    prefabIndex: index,
                });
            });
            return entries;
        }
        if (currentCategory === "Rig") {
            return [
                { id: "spin-bot", label: "Spin Bot", toggle: "spinBot" },
                { id: "rig-spam", label: "Rig Spam (B)", toggle: "rigSpam" },
                { id: "rig-spin-speed-down", label: "Spin Speed -", action: "rigSpinSpeedDown" },
                { id: "rig-spin-speed", label: "Spin Speed: " + rigSpinCurrentSpeed },
                { id: "rig-spin-speed-up", label: "Spin Speed +", action: "rigSpinSpeedUp" },
                { id: "back-rig", label: "< Back", back: true },
            ];
        }
        if (currentCategory === "Titles") {
            const entries = [];
            // Spam Random Titles is always the first button
            entries.push({ id: "title-spam", label: "Spam Random Titles", toggle: "titleSpam" });
            // Individual title buttons — each equips that title server-side
            for (const titleDef of ANIMAL_RIVALS_TITLES) {
                entries.push({
                    id: "title-equip-" + titleDef.id,
                    label: titleDef.label,
                    action: "equipTitle:" + titleDef.id,
                });
            }
            entries.push({ id: "back-titles", label: "< Back", back: true });
            return entries;
        }
        const entries = soundboardSounds
            .map((sound, index) => ({
            id: sound.id,
            label: sound.label.length > 26 ? sound.label.substring(0, 25) + "..." : sound.label,
            soundIndex: index,
        }));
        if (entries.length === 0) {
            entries.push({ id: "soundboard-empty", label: "No sounds found", disabled: true });
        }
        entries.push({ id: "back-soundboard", label: "< Back", back: true });
        return entries;
    }
    function menuPageCount(entryCount) {
        return Math.max(1, Math.ceil(entryCount / MENU_PAGE_SIZE));
    }
    function normalizeCurrentPage(entryCount) {
        const pageCount = menuPageCount(entryCount);
        currentPage = ((currentPage % pageCount) + pageCount) % pageCount;
        return pageCount;
    }
    function buttonIsEnabled(entry) {
        if (entry.toggle !== undefined)
            return mods[entry.toggle];
        return entry.soundIndex !== undefined && soundboardBusy && entry.soundIndex === activeSoundIndex;
    }
    function buttonColor(entry, hovered) {
        if (buttonIsEnabled(entry))
            return hovered ? COLORS.buttonEnabledHover : COLORS.buttonEnabled;
        return hovered ? COLORS.buttonHover : COLORS.button;
    }
    function buttonLabel(entry) {
        return entry.label;
    }
    function fittedTextScale(text, baseScale, characterBudget) {
        const length = Math.max(text.trim().length, 1);
        return baseScale * Math.max(0.55, Math.min(1.0, characterBudget / length));
    }
    function buildMenu() {
        destroyMenu();
        try {
            menuRoot = createEmpty("AnimalRivalsRaspMenu");
            const rootTransform = getTransform(menuRoot);
            rootTransform.method("set_localScale", 1).invoke(EAC_ROOT_SCALE);
            const background = createOutlinedObject("AnimalRivalsMenuBackground", rootTransform, [0.1, 0, 0], [0.1, 1, 1], COLORS.background, false, 0.009);
            menuFrontSurface = background.object;
            const allEntries = menuEntries();
            const pageCount = normalizeCurrentPage(allEntries.length);
            const title = MENU_NAME + " | " + currentCategory + " " + (currentPage + 1) + "/" + pageCount;
            createText(rootTransform, background.object, "AnimalRivalsMenuTitle", title, [0.501, 0, 0.435], COLORS.text, 112, 0.027, fittedTextScale(title, 0.023 * 1.6, 24));
            renderedButtons = [];
            const pageEntries = allEntries.slice(currentPage * MENU_PAGE_SIZE, (currentPage + 1) * MENU_PAGE_SIZE);
            const entries = pageEntries;
            entries.forEach((entry, index) => {
                const button = createOutlinedObject(MENU_BUTTON_PREFIX + entry.id, rootTransform, [0.105, 0, 0.13 - index * 0.04], [0.09, 0.9, 0.08], buttonColor(entry, false), true, 0.0065);
                createText(rootTransform, button.object, "AnimalRivalsMenuLabel:" + entry.id, buttonLabel(entry), [0.501, 0, 0], COLORS.text, 136, 0.036, fittedTextScale(buttonLabel(entry), 0.034, 10.5));
                renderedButtons.push({
                    entry,
                    object: button.object,
                    renderer: button.renderer,
                    collider: getComponent(button.object, Collider),
                });
            });
            const pageButtons = [
                { id: "menu-page-prev", label: "<", pageDelta: -1 },
                { id: "menu-page-next", label: ">", pageDelta: 1 },
            ];
            pageButtons.forEach((entry, index) => {
                const button = createOutlinedObject(MENU_BUTTON_PREFIX + entry.id, rootTransform, [0.115, index === 0 ? 0.20 : -0.20, 0], [0.09, 0.20, 0.90], buttonColor(entry, false), true, 0.006);
                createText(rootTransform, button.object, "AnimalRivalsMenuLabel:" + entry.id, entry.label, [0.501, 0, 0], COLORS.text, 136, 0.036, 0.034);
                renderedButtons.push({
                    entry,
                    object: button.object,
                    renderer: button.renderer,
                    collider: getComponent(button.object, Collider),
                });
            });
            rootTransform.method("set_localScale", 1).invoke([
                EAC_ROOT_SCALE[0] * EAC_MENU_SCALE,
                EAC_ROOT_SCALE[1] * EAC_MENU_SCALE,
                EAC_ROOT_SCALE[2] * EAC_MENU_SCALE,
            ]);
            hoveredButtonId = "";
            if (isUnityObjectAlive(activeLocalPlayer))
                recenterMenu(activeLocalPlayer);
            menuBuildFaulted = false;
            menuRetryFrame = 0;
            console.log("[" + MENU_NAME + "] Opened " + currentCategory + " menu.");
            return true;
        }
        catch (error) {
            console.error("[" + MENU_NAME + "] Menu build failed: " + (error?.stack || error));
            destroyMenu();
            menuBuildFaulted = true;
            menuRetryFrame = frameNumber + 30;
            return false;
        }
    }
    function destroyMenu() {
        destroyMenuPointer();
        if (isUnityObjectAlive(menuRoot))
            destroy(menuRoot);
        const materials = Array.from(menuMaterials.values());
        menuMaterials.clear();
        for (const material of materials) {
            if (isUnityObjectAlive(material))
                destroy(material);
        }
        // Runtime-created meshes do not survive every menu/scene teardown even
        // when their IL2CPP wrapper still has a non-null pointer. Reusing one
        // caused the second menu build to fault inside MeshFilter.set_mesh.
        clearRoundedMeshCache();
        menuRoot = null;
        menuFrontSurface = null;
        menuFont = null;
        menuSurfaceShader = null;
        menuTextRenderers = [];
        menuTextFrontVisible = true;
        renderedButtons = [];
        hoveredButtonId = "";
    }
    function getCameraTransform(player) {
        try {
            const camera = player.field("playerCamera").value;
            if (isLive(camera))
                return camera.method("get_transform", 0).invoke();
        }
        catch (_) { }
        try {
            const camera = Camera.method("get_main", 0).invoke();
            if (isLive(camera))
                return camera.method("get_transform", 0).invoke();
        }
        catch (_) { }
        return null;
    }
    function updateMenuTextFrontVisibility(player) {
        if (!isUnityObjectAlive(menuFrontSurface) || menuTextRenderers.length === 0)
            return;
        let visible;
        try {
            const cameraTransform = getCameraTransform(player);
            if (!isLive(cameraTransform))
                return;
            const cameraPosition = cameraTransform.method("get_position", 0).invoke();
            const surfaceTransform = getTransform(menuFrontSurface);
            const localCameraPosition = surfaceTransform.method("InverseTransformPoint", 1)
                .invoke(cameraPosition);
            // Menu text is authored just beyond the panel's +X face (x=0.5).
            visible = Number(localCameraPosition.field("x").value) > 0.501;
        }
        catch (_) {
            return;
        }
        if (visible === menuTextFrontVisible)
            return;
        menuTextFrontVisible = visible;
        const liveRenderers = [];
        for (const renderer of menuTextRenderers) {
            if (!isLive(renderer))
                continue;
            try {
                renderer.method("set_enabled", 1).invoke(visible);
            }
            catch (_) { }
            liveRenderers.push(renderer);
        }
        menuTextRenderers = liveRenderers;
    }
    function destroyMenuPointer() {
        if (isUnityObjectAlive(menuPointer))
            destroy(menuPointer);
        menuPointer = null;
        menuPointerCollider = null;
    }
    function createMenuPointer(player) {
        destroyMenuPointer();
        const hand = getRightHandTransform(player);
        if (!isLive(hand))
            return false;
        let pointer = null;
        try {
            // Match the Animal Company UNOBF reference ball exactly: a tiny
            // background-colored sphere parented to the hand opposite the menu.
            pointer = GameObject.method("CreatePrimitive", 1).invoke(0);
            setName(pointer, "AnimalRivalsMenuPointer");
            const transform = getTransform(pointer);
            transform.method("SetParent", 2).invoke(hand, false);
            transform.method("set_localPosition", 1).invoke(MENU_POINTER_LOCAL_POSITION);
            transform.method("set_localRotation", 1).invoke(identityQuaternion);
            transform.method("set_localScale", 1).invoke(MENU_POINTER_SCALE);
            setRendererColor(getComponent(pointer, Renderer), COLORS.background);
            const collider = getComponent(pointer, Collider);
            if (isLive(collider)) {
                try {
                    collider.method("set_enabled", 1).invoke(true);
                }
                catch (_) { }
                try {
                    collider.method("set_isTrigger", 1).invoke(true);
                }
                catch (_) { }
            }
            try {
                pointer.method("set_layer", 1).invoke(2);
            }
            catch (_) { }
            menuPointer = pointer;
            menuPointerCollider = collider;
            return true;
        }
        catch (_) {
            if (isLive(pointer))
                destroy(pointer);
            menuPointer = null;
            menuPointerCollider = null;
            return false;
        }
    }
    function ensureMenuPointer(player) {
        if (isUnityObjectAlive(menuPointer))
            return true;
        return createMenuPointer(player);
    }
    function resolveTransformFromField(player, fieldName) {
        try {
            const value = player.field(fieldName).value;
            if (!isLive(value))
                return null;
            if (value.class?.name === "UnityEngine.Transform")
                return value;
            try {
                return value.method("get_transform", 0).invoke();
            }
            catch (_) { }
            return isUnityObjectAlive(value) ? value : null;
        }
        catch (_) {
            return null;
        }
    }
    function isLikelyHandTransform(transform) {
        if (!isUnityObjectAlive(transform))
            return false;
        let name = "";
        try {
            name = (objectName(componentGameObject(transform)) || "").toLowerCase();
        }
        catch (_) { }
        if (!name)
            return true;
        if (/(head|neck|chest|spine|hip|pelvis|camera|face|eye|headset|hmd|body|torso)/i.test(name))
            return false;
        if (/(hand|wrist|palm|controller|grip|index|thumb|trigger|primary|secondary|offhand|secondaryhand)/i.test(name))
            return true;
        return false;
    }
    function getCameraTransformFallback(player) {
        try {
            const cameraTransform = player.field("playerCamera").value;
            if (isUnityObjectAlive(cameraTransform))
                return cameraTransform;
        }
        catch (_) { }
        return null;
    }
    function getLeftHandTransform(player) {
        const candidates = [
            "handLeftAnchor",
            "leftHandAnchor",
            "LeftHandAnchor",
            "leftHand",
            "handLeft",
            "leftHandTransform",
            "leftController",
            "leftControllerTransform",
            "leftControllerAnchor",
        ];
        for (const candidate of candidates) {
            const transform = resolveTransformFromField(player, candidate);
            if (isUnityObjectAlive(transform))
                return transform;
        }
        // Fall back to the active hand transform if legacy fields are not
        // available on this build variant.
        try {
            const hands = getLocalHeldWeapons();
            if (hands.length > 0) {
                const hand = hands[0];
                const transform = getTransform(hand);
                if (isUnityObjectAlive(transform))
                    return transform;
            }
        }
        catch (_) { }
        return null;
    }
    function getRightHandTransform(player) {
        const candidates = [
            "handRightAnchor",
            "rightHandAnchor",
            "RightHandAnchor",
            "handRight",
            "rightHand",
            "rightHandTransform",
            "rightController",
            "rightControllerTransform",
            "rightControllerAnchor",
            "offhand",
            "secondaryHand",
        ];
        let fallback = null;
        for (const candidate of candidates) {
            const transform = resolveTransformFromField(player, candidate);
            if (!isUnityObjectAlive(transform))
                continue;
            if (isLikelyHandTransform(transform))
                return transform;
            if (!fallback)
                fallback = transform;
        }
        if (!isUnityObjectAlive(fallback)) {
            try {
                const hands = getLocalHeldWeapons();
                if (hands.length > 0) {
                    const hand = hands[0];
                    const handTransform = getTransform(hand);
                    if (isUnityObjectAlive(handTransform))
                        return handTransform;
                }
            }
            catch (_) { }
        }
        return fallback;
    }
    function recenterMenu(player) {
        try {
            if (!isUnityObjectAlive(menuRoot))
                return;
            const leftHandTransform = getLeftHandTransform(player);
            if (!isLive(leftHandTransform))
                return;
            const rootTransform = getTransform(menuRoot);
            // Match the UNOBF menu: leave the root unparented and copy the raw
            // left-hand world pose so inherited hand scale cannot distort it.
            rootTransform.method("set_position", 1).invoke(leftHandTransform.method("get_position", 0).invoke());
            rootTransform.method("set_rotation", 1).invoke(leftHandTransform.method("get_rotation", 0).invoke());
            rootTransform.method("set_localScale", 1).invoke([
                EAC_ROOT_SCALE[0] * EAC_MENU_SCALE,
                EAC_ROOT_SCALE[1] * EAC_MENU_SCALE,
                EAC_ROOT_SCALE[2] * EAC_MENU_SCALE,
            ]);
        }
        catch (_) { }
    }
    function readBoolUsage(device, usage) {
        try {
            inputOutBool.writeU8(0);
            const ok = device.method("TryGetFeatureValue", 2)
                .overload("UnityEngine.XR.InputFeatureUsage<System.Boolean>", "System.Boolean&")
                .invoke(usage, inputOutBool);
            return !!ok && inputOutBool.readU8() !== 0;
        }
        catch (_) {
            return false;
        }
    }
    function joystickAxis(value) {
        if (!Number.isFinite(value) || Math.abs(value) < JOYSTICK_DEADZONE)
            return 0.0;
        return Math.max(-1.0, Math.min(1.0, value));
    }
    function readVector2Usage(device, usage) {
        try {
            inputOutVector2.writeFloat(0.0);
            inputOutVector2.add(4).writeFloat(0.0);
            let ok = false;
            try {
                ok = !!device.method("TryGetFeatureValue", 2)
                    .overload("UnityEngine.XR.InputFeatureUsage<UnityEngine.Vector2>", "UnityEngine.Vector2&")
                    .invoke(usage, inputOutVector2);
            }
            catch (_) {
                ok = !!device.method("TryGetFeatureValue", 2).invoke(usage, inputOutVector2);
            }
            if (!ok)
                return [0.0, 0.0];
            return [
                joystickAxis(inputOutVector2.readFloat()),
                joystickAxis(inputOutVector2.add(4).readFloat()),
            ];
        }
        catch (_) {
            return [0.0, 0.0];
        }
    }
    function updateInput(player) {
        leftSecondary = false;
        rightSecondary = false;
        leftTrigger = false;
        leftTriggerAmount = 0.0;
        rightTrigger = false;
        rightTriggerAmount = 0.0;
        leftGrip = false;
        rightGrip = false;
        leftStickX = 0.0;
        leftStickY = 0.0;
        rightStickX = 0.0;
        rightStickY = 0.0;
        try {
            const left = InputDevices.method("GetDeviceAtXRNode", 1).invoke(4);
            const right = InputDevices.method("GetDeviceAtXRNode", 1).invoke(5);
            leftSecondary = readBoolUsage(left, CommonUsages.field("secondaryButton").value);
            leftTrigger = readBoolUsage(left, CommonUsages.field("triggerButton").value);
            rightSecondary = readBoolUsage(right, CommonUsages.field("secondaryButton").value);
            rightTrigger = readBoolUsage(right, CommonUsages.field("triggerButton").value);
            leftGrip = readBoolUsage(left, CommonUsages.field("gripButton").value);
            rightGrip = readBoolUsage(right, CommonUsages.field("gripButton").value);
            [leftStickX, leftStickY] = readVector2Usage(left, CommonUsages.field("primary2DAxis").value);
            [rightStickX, rightStickY] = readVector2Usage(right, CommonUsages.field("primary2DAxis").value);
        }
        catch (_) { }
        try {
            leftTriggerAmount = Number(player.method("GetTriggerControlMagnitude", 1).invoke(0));
            if (leftTriggerAmount > 0.5)
                leftTrigger = true;
        }
        catch (_) {
            leftTriggerAmount = leftTrigger ? 1.0 : 0.0;
        }
        try {
            rightTriggerAmount = Number(player.method("GetTriggerControlMagnitude", 1).invoke(1));
            if (rightTriggerAmount > 0.5)
                rightTrigger = true;
        }
        catch (_) {
            rightTriggerAmount = rightTrigger ? 1.0 : 0.0;
        }
        try {
            if (Number(player.method("GetGripControlMagnitude", 1).invoke(0)) > 0.5)
                leftGrip = true;
        }
        catch (_) { }
        try {
            if (Number(player.method("GetGripControlMagnitude", 1).invoke(1)) > 0.5)
                rightGrip = true;
        }
        catch (_) { }
        rightSecondaryDown = rightSecondary && !rightSecondaryWasPressed;
        rightSecondaryWasPressed = rightSecondary;
        if (mods.rigSpam && rightSecondaryDown) {
            pendingRigSpamPress();
        }
    }
    function eulerFromQuaternion(rotation) {
        try {
            return vector3Value(rotation.method("get_eulerAngles", 0).invoke());
        }
        catch (_) {
            try {
                return vector3Value(rotation.method("eulerAngles", 0).invoke());
            }
            catch (_) {
                return null;
            }
        }
    }
    function findRigVisualTransform(value) {
        const object = hierarchyGameObject(value);
        if (!isUnityObjectAlive(object))
            return null;
        let root = null;
        try {
            root = getTransform(object);
        }
        catch (_) {
            return null;
        }
        // These paths are present in build 1307.  Rotate the avatar skeleton,
        // not the NetworkRig/PlayerController object that can also own the HMD.
        const paths = [
            "masterRig/masterRig_root",
            "MonkeyNetworkRig/masterRig/masterRig_root",
            "MonkeyRig/masterRig/masterRig_root",
        ];
        for (const path of paths) {
            try {
                const child = root.method("Find", 1).invoke(Il2Cpp.string(path));
                if (isUnityObjectAlive(child))
                    return child;
            }
            catch (_) { }
        }
        return root;
    }
    function transformWouldMoveMainCamera(transform) {
        if (!isUnityObjectAlive(transform))
            return true;
        try {
            const camera = Camera.method("get_main", 0).invoke();
            if (!isUnityObjectAlive(camera))
                return false;
            const cameraTransform = getTransform(camera);
            if (!isUnityObjectAlive(cameraTransform))
                return false;
            return sameObject(transform, cameraTransform) ||
                !!cameraTransform.method("IsChildOf", 1).invoke(transform) ||
                !!transform.method("IsChildOf", 1).invoke(cameraTransform);
        }
        catch (_) {
            // A root that cannot be proven independent from the camera is not
            // safe to use for a camera-independent spin.
            return true;
        }
    }
    function collectRigRotateRoots(player) {
        const roots = [];
        const addRoot = (value) => {
            const transform = findRigVisualTransform(value);
            if (!isUnityObjectAlive(transform) || transformWouldMoveMainCamera(transform))
                return;
            const object = hierarchyGameObject(transform);
            const name = (objectName(object) || "").toLowerCase();
            if (/(camera|headset|hmd|tracking.?space|xr.?origin)/i.test(name))
                return;
            if (!roots.some(existing => sameObject(existing, transform)))
                roots.push(transform);
        };
        let localNetworkPlayer = null;
        try {
            const players = objectsOfClass(NetworkPlayer);
            localNetworkPlayer = findLocalNetworkPlayer(players);
            if (isUnityObjectAlive(localNetworkPlayer)) {
                // Prefer explicit replicated body/rig references when a build
                // exposes them under a stable field name.
                for (const fieldName of ["networkRig", "playerAvatar", "avatar", "rig", "body", "playerBody"]) {
                    try {
                        addRoot(localNetworkPlayer.field(fieldName).value);
                    }
                    catch (_) { }
                }
                // Build 1307 renamed several of those fields. Discover fields
                // by both field and declared type names so obfuscated layouts
                // still resolve the NetworkRig/NetworkLocalAvatar component.
                if (roots.length === 0) {
                    try {
                        for (const field of localNetworkPlayer.class.fields || []) {
                            if (field.isStatic)
                                continue;
                            const descriptor = String(field.name || "") + " " + String(field.type?.name || "");
                            if (!/(network.?rig|network.?local.?avatar|network.?avatar|avatar.?behaviour|player.?body)/i.test(descriptor))
                                continue;
                            try {
                                addRoot(localNetworkPlayer.field(String(field.name)).value);
                            }
                            catch (_) { }
                        }
                    }
                    catch (_) { }
                }
                if (roots.length === 0 && NetworkRig) {
                    try {
                        const playerObject = componentGameObject(localNetworkPlayer);
                        const nestedRig = playerObject.method("GetComponentInChildren", 2)
                            .overload("System.Type", "System.Boolean")
                            .invoke(NetworkRig.type.object, true);
                        addRoot(nestedRig);
                    }
                    catch (_) { }
                }
                if (roots.length === 0) {
                    for (const root of localAvatarRoots(localNetworkPlayer))
                        addRoot(root);
                }
            }
        }
        catch (_) { }
        // NetworkLocalAvatar is local-only by definition and is a safer build-
        // independent fallback than rotating the PlayerController hierarchy.
        if (roots.length === 0 && NetworkLocalAvatar) {
            for (const avatar of objectsOfClass(NetworkLocalAvatar, true)) {
                addRoot(avatar);
                if (roots.length > 0)
                    break;
            }
        }
        if (roots.length === 0 && NetworkRig) {
            const rigs = objectsOfClass(NetworkRig, true);
            const authoritative = rigs.filter(rig => networkObjectHasInputAuthority(rig));
            const candidates = authoritative.length > 0 ? authoritative : rigs;
            // Some NetworkRig builds expose authority only on a parent
            // NetworkObject. When that metadata is unavailable, the local rig
            // is the rig closest to the active local PlayerController.
            if (authoritative.length === 0 && isUnityObjectAlive(player)) {
                let playerPosition = null;
                try {
                    playerPosition = vector3Value(getTransform(player).method("get_position", 0).invoke());
                }
                catch (_) { }
                if (playerPosition) {
                    candidates.sort((left, right) => {
                        const distance = (value) => {
                            try {
                                const position = vector3Value(getTransform(value).method("get_position", 0).invoke());
                                if (!position)
                                    return Number.POSITIVE_INFINITY;
                                const dx = position[0] - playerPosition[0];
                                const dy = position[1] - playerPosition[1];
                                const dz = position[2] - playerPosition[2];
                                return dx * dx + dy * dy + dz * dz;
                            }
                            catch (_) {
                                return Number.POSITIVE_INFINITY;
                            }
                        };
                        return distance(left) - distance(right);
                    });
                }
            }
            for (const rig of candidates) {
                addRoot(rig);
                if (roots.length > 0)
                    break;
            }
        }
        // Never fall back to the PlayerController root: it contains the HMD
        // camera and was the reason Spin Bot rotated the user's screen.
        // Rotating both a parent rig and its avatar child would apply the yaw
        // twice, so use the highest-priority safe replicated root only.
        return roots.slice(0, 1);
    }
    function captureRigSpinState(player) {
        const playerKey = visualObjectKey(player);
        if (!playerKey)
            return null;
        if (rigSpinState && rigSpinState.playerKey === playerKey && rigSpinState.roots.length > 0)
            return rigSpinState;
        const roots = collectRigRotateRoots(player);
        const entries = [];
        for (const transform of roots) {
            try {
                const rotation = transform.method("get_localRotation", 0).invoke();
                const baseEuler = eulerFromQuaternion(rotation);
                if (baseEuler) {
                    entries.push({ transform, baseRotation: rotation, baseEuler });
                }
            }
            catch (_) { }
        }
        rigSpinState = {
            playerKey,
            roots: entries,
            active: true,
        };
        return rigSpinState;
    }
    function applyRigSpin(player) {
        if (!mods.spinBot || !isLive(player))
            return;
        const state = captureRigSpinState(player);
        if (!state || state.roots.length === 0) {
            const now = unityNow();
            if (now >= rigSpinNextWarningAt) {
                rigSpinNextWarningAt = now + 5.0;
                console.warn("[" + MENU_NAME + "] Spin Bot is waiting for the local NetworkRig avatar.");
            }
            return;
        }
        rigSpinYaw = (rigSpinYaw + RIG_SPIN_SPEED_DEGREES *
            Math.max(RIG_SPIN_SPEED_MIN, rigSpinCurrentSpeed)) % 360;
        for (const entry of state.roots) {
            try {
                const next = Quaternion.method("Euler", 3).invoke(
                entry.baseEuler[0],
                entry.baseEuler[1] + rigSpinYaw,
                entry.baseEuler[2]);
                entry.transform.method("set_localRotation", 1).invoke(next);
            }
            catch (_) { }
        }
    }
    function restoreRigSpin() {
        if (!rigSpinState)
            return;
        for (const entry of rigSpinState.roots || []) {
            try {
                entry.transform.method("set_localRotation", 1).invoke(entry.baseRotation);
            }
            catch (_) { }
        }
        rigSpinState = null;
        rigSpinYaw = 0.0;
        rigSpinNextWarningAt = -1000.0;
    }
    function readColliderFieldValue(component, fieldName) {
        try {
            return Number(component.field(fieldName).value);
        }
        catch (_) { }
        try {
            const getter = component.method("get_" + fieldName, 0);
            const value = getter.invoke();
            return Number(value);
        }
        catch (_) {
            return Number.NaN;
        }
    }
    function readColliderVectorValue(component, fieldName) {
        try {
            return vector3Value(component.field(fieldName).value);
        }
        catch (_) { }
        try {
            const getter = component.method("get_" + fieldName, 0);
            const value = getter.invoke();
            return vector3Value(value);
        }
        catch (_) {
            return null;
        }
    }
    function writeColliderNumber(component, fieldName, value) {
        try {
            component.field(fieldName).value = value;
            return true;
        }
        catch (_) { }
        try {
            component.method("set_" + fieldName, 1).invoke(value);
            return true;
        }
        catch (_) {
            return false;
        }
    }
    function writeColliderVector(component, fieldName, vector) {
        try {
            const current = component.field(fieldName).value;
            current.field("x").value = vector[0];
            current.field("y").value = vector[1];
            current.field("z").value = vector[2];
            return true;
        }
        catch (_) { }
        const vectorFromValues = () => {
            try {
                const value = Vector3.method("get_zero", 0).invoke();
                value.field("x").value = vector[0];
                value.field("y").value = vector[1];
                value.field("z").value = vector[2];
                return value;
            }
            catch (_) { }
            try {
                return Il2Cpp.structure({
                    x: vector[0],
                    y: vector[1],
                    z: vector[2],
                });
            }
            catch (_) {
                return null;
            }
        };
        try {
            const setter = "set_" + fieldName;
            const method = component.method(setter, 1);
            const vectorTypeName = String(method.parameterTypes[0]?.name || "");
            const value = vectorFromValues();
            if (value && /UnityEngine\.Vector3/i.test(vectorTypeName)) {
                method.invoke(value);
                return true;
            }
        }
        catch (_) { }
        return false;
    }
    function hitboxLayerIndex() {
        if (Number.isInteger(hitboxLayerIndexCache))
            return hitboxLayerIndexCache;
        hitboxLayerIndexCache = 13;
        try {
            const resolved = Number(LayerMask.method("NameToLayer", 1)
                .overload("System.String")
                .invoke(Il2Cpp.string("HitBox")));
            if (Number.isInteger(resolved) && resolved >= 0)
                hitboxLayerIndexCache = resolved;
        }
        catch (_) { }
        return hitboxLayerIndexCache;
    }
    function isDamageHitboxCollider(collider) {
        if (!isUnityObjectAlive(collider))
            return false;
        const object = componentGameObject(collider);
        if (!isUnityObjectAlive(object))
            return false;
        try {
            if (Number(object.method("get_layer", 0).invoke()) !== hitboxLayerIndex())
                return false;
        }
        catch (_) {
            return false;
        }
        const className = String(collider.class?.name || collider.class?.fullName || "");
        return /(BoxCollider|SphereCollider|CapsuleCollider)$/i.test(className);
    }
    function applyHitboxScaleToCollider(collider, scaleMultiplier, patchList) {
        if (!isDamageHitboxCollider(collider))
            return;
        const className = String(collider.class?.name || collider.class?.fullName || "");
        const patchNumber = (fieldName) => {
            const original = readColliderFieldValue(collider, fieldName);
            if (!Number.isFinite(original) || original <= 0)
                return;
            if (writeColliderNumber(collider, fieldName, original * scaleMultiplier))
                patchList.push({ collider, kind: "number", fieldName, original });
        };
        if (/BoxCollider$/i.test(className)) {
            const original = readColliderVectorValue(collider, "size");
            if (original && writeColliderVector(collider, "size", [
                original[0] * scaleMultiplier,
                original[1] * scaleMultiplier,
                original[2] * scaleMultiplier,
            ])) {
                patchList.push({ collider, kind: "vector", fieldName: "size", original });
            }
            return;
        }
        if (/SphereCollider$/i.test(className)) {
            patchNumber("radius");
            return;
        }
        if (/CapsuleCollider$/i.test(className)) {
            patchNumber("radius");
            patchNumber("height");
        }
    }
    function restoreHitboxEntries(entries) {
        for (const entry of entries || []) {
            if (!isUnityObjectAlive(entry.collider))
                continue;
            if (entry.kind === "number") {
                writeColliderNumber(entry.collider, entry.fieldName, entry.original);
            }
            else if (entry.kind === "vector") {
                writeColliderVector(entry.collider, entry.fieldName, entry.original);
            }
        }
    }
    function restoreExtendHitboxes() {
        for (const entries of originalRigHitboxes.values())
            restoreHitboxEntries(entries);
        originalRigHitboxes.clear();
        extendHitboxNextRefreshFrame = -1000;
    }
    function collectDamageHitboxColliders(player) {
        const result = [];
        const seen = new Set();
        if (isBot(player)) {
            try {
                const receiver = player.method("get_DamageReceiver", 0).invoke();
                for (const box of objectArrayValues(receiver.method("get_HitBoxes", 0).invoke())) {
                    if (!isUnityObjectAlive(box)) continue;
                    const collider = getComponent(box, Collider);
                    const key = visualObjectKey(collider);
                    if (isUnityObjectAlive(collider) && key && !seen.has(key)) {
                        seen.add(key);
                        result.push(collider);
                    }
                }
            } catch (_) {}
            if (result.length) return result;
        }
        for (const root of localAvatarRoots(player)) {
            try {
                const colliders = root.method("GetComponentsInChildren", 2)
                    .overload("System.Type", "System.Boolean")
                    .invoke(Collider.type.object, true);
                for (const collider of objectArrayValues(colliders)) {
                    if (!isDamageHitboxCollider(collider))
                        continue;
                    const colliderKey = visualObjectKey(collider);
                    if (!colliderKey || seen.has(colliderKey))
                        continue;
                    seen.add(colliderKey);
                    result.push(collider);
                }
            }
            catch (_) { }
        }
        return result;
    }
    function applyExtendHitboxes(player) {
        if (!mods.extendHitboxes)
            return;
        if (!isLive(player))
            return;
        if (frameNumber < extendHitboxNextRefreshFrame)
            return;
        extendHitboxNextRefreshFrame = frameNumber + EXTEND_HITBOX_REFRESH_FRAMES;
        const players = objectsOfClass(NetworkPlayer);
        const localPlayer = findLocalNetworkPlayer(players);
        const activeKeys = new Set();
        for (const remote of players) {
            if (!isUnityObjectAlive(remote) || isLocalNetworkTarget(remote, localPlayer))
                continue;
            const playerKey = visualObjectKey(remote);
            if (!playerKey)
                continue;
            activeKeys.add(playerKey);
            const existing = originalRigHitboxes.get(playerKey);
            const colliders = collectDamageHitboxColliders(remote);
            const signature = colliders.map(visualObjectKey).sort().join("|");
            if (existing) {
                // Reassert periodically even when the collider set is
                // unchanged. Avatar code can reset dimensions in place, and
                // a write that failed on the first scan should be retried.
                restoreHitboxEntries(existing);
                originalRigHitboxes.delete(playerKey);
            }
            const patchList = [];
            for (const collider of colliders)
                applyHitboxScaleToCollider(collider, RIG_HITBOX_SCALE, patchList);
            if (patchList.length > 0) {
                patchList.signature = signature;
                originalRigHitboxes.set(playerKey, patchList);
            }
        }
        for (const key of Array.from(originalRigHitboxes.keys())) {
            if (!activeKeys.has(key)) {
                restoreHitboxEntries(originalRigHitboxes.get(key));
                originalRigHitboxes.delete(key);
            }
        }
    }
    function rigSpamReportError(message) {
        const text = String(message || "unknown local rig clone failure");
        const now = unityNow();
        if (text !== rigSpamLastError || now >= rigSpamNextErrorAt) {
            console.error("[" + MENU_NAME + "] Rig Spam unavailable: " + text + ".");
            rigSpamLastError = text;
            rigSpamNextErrorAt = now + 2.0;
        }
    }
    function isRegisteredLocalNetworkPlayer(player) {
        if (!isUnityObjectAlive(player) || !networkObjectHasInputAuthority(player))
            return false;
        try {
            const sourceObject = player.method("get_Object", 0).invoke();
            if (!isUnityObjectAlive(sourceObject))
                return false;
            const runner = sourceObject.method("get_Runner", 0).invoke();
            if (!isUnityObjectAlive(runner))
                return false;
            const localPlayerRef = runner.method("get_LocalPlayer", 0).invoke();
            const registeredObject = runner.method("GetPlayerObject", 1)
                .overload("Fusion.PlayerRef")
                .invoke(localPlayerRef);
            return isUnityObjectAlive(registeredObject) && sameObject(sourceObject, registeredObject);
        }
        catch (_) {
            return false;
        }
    }
    function strictLocalNetworkPlayer() {
        const players = objectsOfClass(NetworkPlayer);
        for (const glider of objectsOfClass(PlayerGlider)) {
            try {
                if (!sameObject(glider.field("player").value, activeLocalPlayer))
                    continue;
                const networkPlayer = glider.field("networkPlayer").value;
                if (isRegisteredLocalNetworkPlayer(networkPlayer))
                    return networkPlayer;
            }
            catch (_) { }
        }
        for (const player of players) {
            if (isRegisteredLocalNetworkPlayer(player))
                return player;
        }
        return null;
    }
    function rigSpamRunnerForPlayer(player) {
        if (!FusionNetworkObject || !FusionNetworkRunner || !isUnityObjectAlive(player))
            throw new Error("Fusion runtime is not ready");
        if (!isRegisteredLocalNetworkPlayer(player))
            throw new Error("the canonical local NetworkPlayer is not ready");
        const sourceObject = player.method("get_Object", 0).invoke();
        if (!isUnityObjectAlive(sourceObject) ||
            !FusionNetworkObject.isAssignableFrom(sourceObject.class))
            throw new Error("local NetworkObject is not ready");
        if (!networkObjectHasInputAuthority(player))
            throw new Error("local rig has no input authority");
        if (!networkObjectHasStateAuthority(player))
            throw new Error("local rig has no state authority");
        const runner = sourceObject.method("get_Runner", 0).invoke();
        if (!isUnityObjectAlive(runner) || !FusionNetworkRunner.isAssignableFrom(runner.class))
            throw new Error("local NetworkRunner is not ready");
        if (methodBoolean(runner, ["get_IsRunning"]) !== true)
            throw new Error("NetworkRunner is not running");
        if (methodBoolean(runner, ["get_CanSpawn"]) !== true)
            throw new Error("this peer cannot authoritatively spawn");
        if (methodBoolean(runner, ["get_IsInSession"]) === false)
            throw new Error("NetworkRunner is not in a session");
        if (methodBoolean(runner, ["get_IsShutdown"]) === true)
            throw new Error("NetworkRunner is shutting down");
        return { sourceObject, runner };
    }
    function resolveRigSpamSpawnMethod() {
        if (rigSpamSpawnMethod)
            return rigSpamSpawnMethod;
        if (!FusionNetworkRunner)
            return null;
        const matches = [];
        let reflectedMethods = null;
        try {
            reflectedMethods = FusionNetworkRunner.type.object.method("GetMethods", 0).invoke();
        }
        catch (_) {
            return null;
        }
        for (let i = 0; i < reflectedMethods.length; i++) {
            try {
                const reflected = reflectedMethods.get(i);
                const reflectedName = reflected.method("get_Name", 0).invoke();
                if (!reflectedName || reflectedName.content !== "Spawn" ||
                    reflected.method("get_IsGenericMethod", 0).invoke())
                    continue;
                const reflectedParameters = reflected.method("GetParameters", 0).invoke();
                if (!reflectedParameters || reflectedParameters.length !== 6)
                    continue;
                const firstType = reflectedParameters.get(0)
                    .method("get_ParameterType", 0).invoke();
                const firstTypeName = firstType.method("get_Name", 0).invoke();
                if (!firstTypeName || firstTypeName.content !== "NetworkPrefabId")
                    continue;
                const method = new Il2Cpp.Method(reflected.field("mhandle").value);
                if (String(method.returnType.name) !== "Fusion.NetworkObject")
                    continue;
                const names = method.parameters.map(parameter => String(parameter.type.name));
                if (names[0] !== "Fusion.NetworkPrefabId" ||
                    !/^System\.Nullable<.*UnityEngine\.Vector3.*>$/.test(names[1]) ||
                    !/^System\.Nullable<.*UnityEngine\.Quaternion.*>$/.test(names[2]) ||
                    !/^System\.Nullable<.*Fusion\.PlayerRef.*>$/.test(names[3]) ||
                    !/Fusion\.NetworkRunner[\/.]OnBeforeSpawned$/.test(names[4]) ||
                    names[5] !== "Fusion.NetworkSpawnFlags")
                    continue;
                matches.push(method);
            }
            catch (_) { }
        }
        if (matches.length !== 1)
            return null;
        rigSpamSpawnMethod = matches[0];
        return rigSpamSpawnMethod;
    }
    function resolveRigSpamDespawnMethod() {
        if (rigSpamDespawnMethod)
            return rigSpamDespawnMethod;
        if (!FusionNetworkRunner)
            return null;
        const matches = [];
        let reflectedMethods = null;
        try {
            reflectedMethods = FusionNetworkRunner.type.object.method("GetMethods", 0).invoke();
        }
        catch (_) {
            return null;
        }
        for (let i = 0; i < reflectedMethods.length; i++) {
            try {
                const reflected = reflectedMethods.get(i);
                const reflectedName = reflected.method("get_Name", 0).invoke();
                if (!reflectedName || reflectedName.content !== "Despawn" ||
                    reflected.method("get_IsGenericMethod", 0).invoke())
                    continue;
                const reflectedParameters = reflected.method("GetParameters", 0).invoke();
                if (!reflectedParameters || reflectedParameters.length !== 1)
                    continue;
                const parameterType = reflectedParameters.get(0)
                    .method("get_ParameterType", 0).invoke();
                const parameterTypeName = parameterType.method("get_Name", 0).invoke();
                if (!parameterTypeName || parameterTypeName.content !== "NetworkObject")
                    continue;
                const method = new Il2Cpp.Method(reflected.field("mhandle").value);
                if (String(method.returnType.name) !== "System.Void")
                    continue;
                const names = method.parameters.map(parameter => String(parameter.type.name));
                if (names[0] === "Fusion.NetworkObject")
                    matches.push(method);
            }
            catch (_) { }
        }
        if (matches.length !== 1)
            return null;
        rigSpamDespawnMethod = matches[0];
        return rigSpamDespawnMethod;
    }
    function makeRigSpamNullable(parameterType, innerValue) {
        const typeName = String(parameterType?.name || "");
        if (!/^System\.Nullable<.+>$/.test(typeName) || !parameterType.class.isValueType)
            throw new Error("unexpected nullable ABI for " + typeName);
        const storage = Memory.alloc(parameterType.class.valueTypeSize);
        storage.writeByteArray(new Uint8Array(parameterType.class.valueTypeSize));
        const value = new Il2Cpp.ValueType(storage, parameterType);
        const hasValueField = value.tryField("hasValue");
        const slotField = value.tryField("value");
        if (!hasValueField || !slotField)
            throw new Error("nullable fields are unavailable for " + typeName);
        hasValueField.value = false;
        if (innerValue !== null) {
            if (!(innerValue instanceof Il2Cpp.ValueType))
                throw new Error("nullable payload is not a value type for " + typeName);
            const slot = slotField.value;
            if (!(slot instanceof Il2Cpp.ValueType) || !slot.type.is(innerValue.type))
                throw new Error("nullable payload type mismatch for " + typeName);
            Memory.copy(slot.handle, innerValue.handle, slot.type.class.valueTypeSize);
            hasValueField.value = true;
        }
        return { value, storage };
    }
    function rigSpamPrefabId(networkObject, runner) {
        const typeId = networkObject.field("NetworkTypeId").value;
        if (!(typeId instanceof Il2Cpp.ValueType))
            throw new Error("NetworkTypeId is unavailable");
        if (!typeId.method("get_IsValid", 0).invoke() || !typeId.method("get_IsPrefab", 0).invoke())
            throw new Error("avatar rig is not a registered prefab instance");
        const prefabId = typeId.method("get_AsPrefabId", 0).invoke();
        if (!(prefabId instanceof Il2Cpp.ValueType) ||
            !prefabId.method("get_IsValid", 0).invoke())
            throw new Error("avatar NetworkPrefabId is unavailable");
        const prefabs = runner.method("get_Prefabs", 0).invoke();
        if (!isLive(prefabs) || !prefabs.method("Contains", 1)
            .overload("Fusion.NetworkPrefabId").invoke(prefabId))
            throw new Error("avatar prefab is not registered with this runner");
        return prefabId;
    }
    function rigSpamPrefabIdsEqual(left, right) {
        try {
            return !!left.method("Equals", 1)
                .overload("Fusion.NetworkPrefabId")
                .invoke(right);
        }
        catch (_) {
            return false;
        }
    }
    function rigSpamObjectIsTracked(networkObject) {
        return rigSpamObjects.some(entry => entry &&
            isUnityObjectAlive(entry.networkObject) && sameObject(entry.networkObject, networkObject));
    }
    function rigSpamAvatarSourceIsLocal(behaviour, networkObject, runner) {
        try {
            if (!isUnityObjectAlive(behaviour) || !isUnityObjectAlive(networkObject) ||
                !isUnityObjectAlive(runner) || !componentIsActiveInScene(behaviour) ||
                rigSpamObjectIsTracked(networkObject))
                return false;
            if (!sameObject(behaviour.method("get_Object", 0).invoke(), networkObject) ||
                !sameObject(networkObject.method("get_Runner", 0).invoke(), runner) ||
                methodBoolean(networkObject, ["get_IsValid"]) !== true ||
                methodBoolean(networkObject, ["get_IsInSimulation"]) !== true ||
                methodBoolean(networkObject, ["get_HasInputAuthority"]) !== true ||
                methodBoolean(networkObject, ["get_HasStateAuthority"]) !== true)
                return false;
            const inputAuthority = networkObject.method("get_InputAuthority", 0).invoke();
            const localPlayer = runner.method("get_LocalPlayer", 0).invoke();
            if (!(inputAuthority instanceof Il2Cpp.ValueType) ||
                !(localPlayer instanceof Il2Cpp.ValueType) ||
                Number(inputAuthority.method("get_RawEncoded", 0).invoke()) !==
                Number(localPlayer.method("get_RawEncoded", 0).invoke()))
                return false;
            const object = componentGameObject(networkObject);
            if (!isUnityObjectAlive(object))
                return false;
            // Build 1335 no longer instantiates AvatarBehaviourFusion. Its real
            // replicated body is NetworkRig on the same prefab as NetworkPlayer.
            if (NetworkRig && NetworkRig.isAssignableFrom(behaviour.class))
                return isUnityObjectAlive(getComponent(object, NetworkRig));
            return !!AvatarBehaviourFusion &&
                AvatarBehaviourFusion.isAssignableFrom(behaviour.class);
        }
        catch (_) {
            return false;
        }
    }
    function rigSpamAvatarSourceForRunner(runner) {
        const candidates = [];
        for (const klass of [NetworkRig, AvatarBehaviourFusion].filter(Boolean)) {
            for (const behaviour of objectsOfClass(klass)) {
                try {
                    const networkObject = behaviour.method("get_Object", 0).invoke();
                    if (!rigSpamAvatarSourceIsLocal(behaviour, networkObject, runner))
                        continue;
                    candidates.push({
                        behaviour,
                        networkObject,
                        kind: NetworkRig && NetworkRig.isAssignableFrom(behaviour.class)
                            ? "networkRig" : "metaAvatar",
                    });
                }
                catch (_) { }
            }
            if (candidates.length > 0)
                break;
        }
        return candidates.length > 0 ? candidates[0] : null;
    }
    function rigSpamAvatarPrefabForRunner(runner) {
        if (!NetworkRig && !AvatarBehaviourFusion)
            throw new Error("network rig runtime is unavailable");
        if (rigSpamAvatarPrefabState &&
            sameObject(rigSpamAvatarPrefabState.runner, runner) &&
            rigSpamAvatarSourceIsLocal(
                rigSpamAvatarPrefabState.sourceBehaviour,
                rigSpamAvatarPrefabState.sourceNetworkObject,
                runner)) {
            try {
                const currentPrefabId = rigSpamPrefabId(
                    rigSpamAvatarPrefabState.sourceNetworkObject, runner);
                if (rigSpamPrefabIdsEqual(currentPrefabId, rigSpamAvatarPrefabState.prefabId))
                    return rigSpamAvatarPrefabState;
            }
            catch (_) { }
        }
        rigSpamAvatarPrefabState = null;
        const source = rigSpamAvatarSourceForRunner(runner);
        if (!source)
            throw new Error("the live local Fusion avatar is not ready");
        const prefabId = rigSpamPrefabId(source.networkObject, runner);
        const object = componentGameObject(source.networkObject);
        const name = objectName(object) || "live FusionAvatar";
        rigSpamAvatarPrefabState = {
            prefabId,
            runner,
            sourceBehaviour: source.behaviour,
            sourceNetworkObject: source.networkObject,
            kind: source.kind,
            name,
        };
        console.log("[" + MENU_NAME + "] Rig Spam SS prefab: " + name +
            " (" + source.kind + ", matched live PrefabId).");
        return rigSpamAvatarPrefabState;
    }
    function despawnRigSpamEntry(entry) {
        if (!entry || !isUnityObjectAlive(entry.networkObject))
            return "gone";
        if (methodBoolean(entry.networkObject, ["get_IsValid"]) === false ||
            methodBoolean(entry.networkObject, ["get_IsInSimulation"]) === false)
            return "gone";
        if (!isUnityObjectAlive(entry.runner))
            return "gone";
        try {
            if (methodBoolean(entry.runner, ["get_IsShutdown"]) === true ||
                methodBoolean(entry.runner, ["get_IsRunning"]) === false ||
                methodBoolean(entry.runner, ["get_IsInSession"]) === false)
                return "gone";
            const objectRunner = entry.networkObject.method("get_Runner", 0).invoke();
            if (!sameObject(objectRunner, entry.runner))
                return "unowned";
            if (methodBoolean(entry.networkObject, ["get_HasStateAuthority"]) !== true)
                return "unowned";
            const despawn = resolveRigSpamDespawnMethod();
            if (!despawn)
                return "retry";
            despawn.bind(entry.runner).invoke(entry.networkObject);
            return "despawned";
        }
        catch (_) {
            return "retry";
        }
    }
    function retainRigSpamCleanupEntry(entry, outcome, now) {
        if (outcome === "gone" || outcome === "despawned")
            return false;
        if (outcome === "unowned") {
            if (!Number.isFinite(entry.unownedSince))
                entry.unownedSince = now;
            if (now >= entry.unownedSince + 2.0)
                return false;
        }
        else {
            entry.unownedSince = null;
        }
        entry.expiresAt = now + 0.25;
        return true;
    }
    function cameraRendersLayer(layer) {
        if (!Number.isInteger(layer) || layer < 0 || layer > 31)
            return false;
        try {
            const camera = Camera.method("get_main", 0).invoke();
            if (!isUnityObjectAlive(camera))
                return true;
            const mask = Number(camera.method("get_cullingMask", 0).invoke()) | 0;
            return ((mask >>> layer) & 1) !== 0;
        }
        catch (_) {
            return true;
        }
    }
    function resolveRigSpamVisibleLayer() {
        if (Number.isInteger(rigSpamVisibleLayer) && cameraRendersLayer(rigSpamVisibleLayer))
            return rigSpamVisibleLayer;
        const players = objectsOfClass(NetworkPlayer);
        const local = findLocalNetworkPlayer(players);
        for (const remote of players) {
            if (!isUnityObjectAlive(remote) || isLocalNetworkTarget(remote, local))
                continue;
            for (const root of localAvatarRoots(remote)) {
                try {
                    const layer = Number(root.method("get_layer", 0).invoke());
                    if (Number.isInteger(layer) && cameraRendersLayer(layer)) {
                        rigSpamVisibleLayer = layer;
                        return layer;
                    }
                }
                catch (_) { }
            }
        }
        try {
            const defaultLayer = Number(LayerMask.method("NameToLayer", 1)
                .invoke(Il2Cpp.string("Default")));
            if (Number.isInteger(defaultLayer) && defaultLayer >= 0 && cameraRendersLayer(defaultLayer)) {
                rigSpamVisibleLayer = defaultLayer;
                return defaultLayer;
            }
        }
        catch (_) { }
        for (let layer = 0; layer < 32; layer++) {
            if (cameraRendersLayer(layer)) {
                rigSpamVisibleLayer = layer;
                return layer;
            }
        }
        rigSpamVisibleLayer = 0;
        return 0;
    }
    function enforceRigSpamLocalVisibility(entry) {
        if (!entry || !isUnityObjectAlive(entry.networkObject))
            return;
        // FIX: run every frame (was skipping after first frame which left clones
        // invisible — Meta Avatar SDK re-applies forceRenderingOff on local dupe).
        // Only coarse-throttle at RIG_SPAM_VISIBILITY_ENFORCE_EVERY_FRAMES to
        // avoid stacking per-clone iteration cost at high clone counts.
        if (Number.isFinite(entry.lastLocalVisibilityFrame) &&
            frameNumber - entry.lastLocalVisibilityFrame < RIG_SPAM_VISIBILITY_ENFORCE_EVERY_FRAMES)
            return;
        entry.lastLocalVisibilityFrame = frameNumber;
        const object = componentGameObject(entry.networkObject);
        if (!isUnityObjectAlive(object))
            return;
        try {
            object.method("SetActive", 1).invoke(true);
        }
        catch (_) { }
        // Resolve the target layer for remote-player avatars so the main
        // camera's culling mask includes our clone.
        const targetLayer = resolveRigSpamVisibleLayer();
        setObjectLayerRecursively(object, targetLayer);
        // The avatar prefab can classify a duplicate of the local Oculus ID as
        // a hidden local body. Aggressively override forceRenderingOff and
        // enabled on EVERY renderer every frame — the Meta Avatar SDK will
        // keep toggling these back to hidden until we win the per-frame race.
        for (const klass of [SkinnedMeshRenderer, MeshRenderer]) {
            for (const renderer of childRenderers(object, klass)) {
                try {
                    renderer.method("set_forceRenderingOff", 1).invoke(false);
                }
                catch (_) { }
                try {
                    renderer.method("set_enabled", 1).invoke(true);
                }
                catch (_) { }
                // Also fix the layer on the renderer's GameObject directly
                // in case setObjectLayerRecursively missed it.
                try {
                    const rendererGo = renderer.method("get_gameObject", 0).invoke();
                    if (isUnityObjectAlive(rendererGo))
                        rendererGo.method("set_layer", 1).invoke(targetLayer);
                }
                catch (_) { }
            }
        }
    }
    function pruneRigSpamClones() {
        const now = unityNow();
        const active = [];
        for (const entry of rigSpamObjects) {
            if (!entry || !isUnityObjectAlive(entry.networkObject))
                continue;
            enforceRigSpamLocalVisibility(entry);
            if (now >= entry.expiresAt) {
                const outcome = despawnRigSpamEntry(entry);
                if (!retainRigSpamCleanupEntry(entry, outcome, now))
                    continue;
            }
            active.push(entry);
        }
        rigSpamObjects = active;
    }
    function clearRigSpamClones() {
        const remaining = [];
        for (const entry of rigSpamObjects) {
            if (!entry || !isUnityObjectAlive(entry.networkObject))
                continue;
            const now = unityNow();
            const outcome = despawnRigSpamEntry(entry);
            if (!retainRigSpamCleanupEntry(entry, outcome, now))
                continue;
            remaining.push(entry);
        }
        rigSpamObjects = remaining;
    }
    function rigSpamPose(player) {
        const transform = getTransform(player);
        if (!isUnityObjectAlive(transform))
            throw new Error("local rig transform is unavailable");
        const position = transform.method("get_position", 0).invoke();
        const rotation = transform.method("get_rotation", 0).invoke();
        if (!(position instanceof Il2Cpp.ValueType) || !(rotation instanceof Il2Cpp.ValueType))
            throw new Error("local rig pose ABI is unavailable");
        try {
            const forward = transform.method("get_forward", 0).invoke();
            for (const axis of ["x", "y", "z"]) {
                const field = position.field(axis);
                field.value = Number(field.value) + Number(forward.field(axis).value) * 0.95;
            }
        }
        catch (_) {
            const z = position.field("z");
            z.value = Number(z.value) + 0.95;
        }
        return { position, rotation };
    }
    function validateRigSpamSpawn(spawned, playerSourceObject, runner, avatarState) {
        if (!isUnityObjectAlive(spawned) || sameObject(spawned, playerSourceObject) ||
            sameObject(spawned, avatarState.sourceNetworkObject))
            return null;
        if (methodBoolean(spawned, ["get_IsValid"]) !== true ||
            methodBoolean(spawned, ["get_HasStateAuthority"]) !== true ||
            methodBoolean(spawned, ["get_IsInSimulation"]) === false)
            return null;
        try {
            if (!sameObject(spawned.method("get_Runner", 0).invoke(), runner))
                return null;
            const object = componentGameObject(spawned);
            if (!isUnityObjectAlive(object))
                return null;
            const behaviour = avatarState.kind === "networkRig"
                ? getComponent(object, NetworkRig)
                : getComponent(object, AvatarBehaviourFusion);
            if (!isUnityObjectAlive(behaviour))
                return null;
            const networkTransform = FusionNetworkTransform
                ? getComponent(object, FusionNetworkTransform)
                : null;
            const spawnedPrefabId = rigSpamPrefabId(spawned, runner);
            if (!rigSpamPrefabIdsEqual(spawnedPrefabId, avatarState.prefabId))
                return null;
            return { behaviour, networkTransform };
        }
        catch (_) {
            return null;
        }
    }
    function copyRigSpamAvatarState(source, clone) {
        if (!isUnityObjectAlive(source) || !isUnityObjectAlive(clone))
            throw new Error("avatar identity source is unavailable");
        const cloneObject = clone.method("get_Object", 0).invoke();
        if (!isUnityObjectAlive(cloneObject) ||
            methodBoolean(cloneObject, ["get_IsValid"]) !== true ||
            methodBoolean(cloneObject, ["get_HasStateAuthority"]) !== true)
            throw new Error("spawned avatar state is not writable");
        if (NetworkRig && NetworkRig.isAssignableFrom(source.class) &&
            NetworkRig.isAssignableFrom(clone.class)) {
            const sourceSetup = source.field("rigSetup").value;
            const cloneSetup = clone.field("rigSetup").value;
            if (!isLive(sourceSetup) || !isLive(cloneSetup))
                throw new Error("network rig setup is unavailable");
            for (const part of ["head", "body", "leftHand", "rightHand", "leftFoot", "rightFoot"]) {
                try {
                    const sourcePart = sourceSetup.field(part).value;
                    const clonePart = cloneSetup.field(part).value;
                    if (!isUnityObjectAlive(sourcePart) || !isUnityObjectAlive(clonePart))
                        continue;
                    const sourceTransform = getTransform(sourcePart);
                    const cloneTransform = getTransform(clonePart);
                    cloneTransform.method("set_position", 1)
                        .invoke(sourceTransform.method("get_position", 0).invoke());
                    cloneTransform.method("set_rotation", 1)
                        .invoke(sourceTransform.method("get_rotation", 0).invoke());
                }
                catch (_) { }
            }
            // Do not call Fusion's generated CopyBackingFieldsToState manually.
            // Spawned network behaviours already own a valid state buffer; the
            // generated copier expects Fusion's simulation context and faults
            // when invoked from PlayerController.LateUpdate.
            return;
        }
        const oculusId = source.method("get_OculusId", 0).invoke();
        const sourceAvatarIndex = Number(source.method("get_LocalAvatarIndex", 0).invoke());
        if (!Number.isInteger(sourceAvatarIndex))
            throw new Error("avatar identity is invalid");
        // Reusing the local avatar's exact OculusId/index pair makes Meta's
        // runtime deduplicate the clone as the hidden self avatar on this
        // headset. A temporary distinct index preserves the same appearance
        // and stream while forcing every client, including the owner, to build
        // a separate remote-avatar renderer.
        const cloneAvatarIndex = sourceAvatarIndex;
        clone.method("set_OculusId", 1).overload("System.UInt64").invoke(oculusId);
        clone.method("set_LocalAvatarIndex", 1).overload("System.Int32").invoke(cloneAvatarIndex);
        try {
            clone.method("OnAvatarIdChanged", 0).invoke();
        }
        catch (_) { }
        const length = Number(source.method("get_AvatarDataStreamLength", 0).invoke());
        if (!Number.isInteger(length) || length < 0 || length > 900)
            throw new Error("avatar stream length is invalid");
        const networkArray = source.method("get_AvatarDataStream", 0).invoke();
        if (!(networkArray instanceof Il2Cpp.ValueType))
            throw new Error("avatar NetworkArray is unavailable");
        const full = networkArray.method("ToArray", 0).invoke();
        if (!(full instanceof Il2Cpp.Array) || full.length < length)
            throw new Error("avatar stream materialization failed");
        const exact = Il2Cpp.array(Il2Cpp.corlib.class("System.Byte"), length);
        for (let index = 0; index < length; index++)
            exact.set(index, full.get(index));
        clone.method("ReceiveStreamData", 1).overload("System.Byte[]").invoke(exact);
        try {
            clone.method("OnAvatarDataStreamChanged", 0).invoke();
        }
        catch (_) { }
        if (Number(clone.method("get_AvatarDataStreamLength", 0).invoke()) !== length)
            throw new Error("avatar stream copy did not commit");
    }
    function spawnRigDupeAtPlayer(player) {
        let spawned = null;
        let runner = null;
        let stage = "resolve runner";
        const nullablePins = [];
        try {
            pruneRigSpamClones();
            const context = rigSpamRunnerForPlayer(player);
            runner = context.runner;
            stage = "enforce clone limit";
            while (rigSpamObjects.filter(entry => entry &&
                isUnityObjectAlive(entry.networkObject) &&
                isUnityObjectAlive(entry.runner) && sameObject(entry.runner, runner) &&
                !Number.isFinite(entry.unownedSince) &&
                methodBoolean(entry.networkObject, ["get_HasStateAuthority"]) === true).length >=
                RIG_SPAM_MAX_ACTIVE_CLONES) {
                const oldestIndex = rigSpamObjects.findIndex(entry => entry &&
                    isUnityObjectAlive(entry.networkObject) &&
                    isUnityObjectAlive(entry.runner) && sameObject(entry.runner, runner) &&
                    !Number.isFinite(entry.unownedSince) &&
                    methodBoolean(entry.networkObject, ["get_HasStateAuthority"]) === true);
                if (oldestIndex < 0)
                    break;
                const oldest = rigSpamObjects[oldestIndex];
                const now = unityNow();
                const outcome = despawnRigSpamEntry(oldest);
                if (outcome === "retry") {
                    retainRigSpamCleanupEntry(oldest, outcome, now);
                    throw new Error("the oldest avatar rig could not be despawned");
                }
                if (retainRigSpamCleanupEntry(oldest, outcome, now))
                    continue;
                rigSpamObjects.splice(oldestIndex, 1);
            }
            stage = "resolve live rig prefab";
            const avatarState = rigSpamAvatarPrefabForRunner(runner);
            stage = "resolve spawn pose";
            const pose = rigSpamPose(player);
            stage = "resolve Fusion Spawn";
            const spawn = resolveRigSpamSpawnMethod();
            if (!spawn)
                throw new Error("the exact NetworkPrefabId Spawn overload was not found");
            const parameters = spawn.parameters;
            stage = "build Fusion position argument";
            const position = makeRigSpamNullable(parameters[1].type, pose.position);
            stage = "build Fusion rotation argument";
            const rotation = makeRigSpamNullable(parameters[2].type, pose.rotation);
            stage = "build Fusion input-authority argument";
            const inputAuthority = makeRigSpamNullable(parameters[3].type, null);
            nullablePins.push(position.storage, rotation.storage, inputAuthority.storage);
            stage = "invoke Fusion Spawn";
            spawned = spawn.bind(runner).invoke(
                avatarState.prefabId,
                position.value,
                rotation.value,
                inputAuthority.value,
                NULL,
                0);
            stage = "validate spawned rig";
            const spawnedAvatar = validateRigSpamSpawn(
                spawned, context.sourceObject, runner, avatarState);
            if (!spawnedAvatar)
                throw new Error("Fusion rejected the authoritative avatar rig spawn");
            stage = "copy spawned rig state";
            copyRigSpamAvatarState(avatarState.sourceBehaviour, spawnedAvatar.behaviour);
            const entry = {
                runner,
                networkObject: spawned,
                expiresAt: unityNow() + RIG_SPAM_CLONE_LIFETIME_SECONDS,
                lastLocalVisibilityFrame: -1000,
            };
            enforceRigSpamLocalVisibility(entry);
            rigSpamObjects.push(entry);
            rigSpamLastError = "";
            console.log("[" + MENU_NAME + "] Rig Spam spawned a replicated avatar rig (" +
                rigSpamObjects.length + "/" + RIG_SPAM_MAX_ACTIVE_CLONES + ").");
            return true;
        }
        catch (error) {
            if (isUnityObjectAlive(spawned)) {
                const cleanup = {
                    runner,
                    networkObject: spawned,
                    expiresAt: unityNow(),
                };
                const now = unityNow();
                const outcome = despawnRigSpamEntry(cleanup);
                if (retainRigSpamCleanupEntry(cleanup, outcome, now))
                    rigSpamObjects.push(cleanup);
            }
            const detail = error && error.message ? error.message : error;
            rigSpamReportError(stage + ": " + detail);
            return false;
        }
        finally {
            for (const pin of nullablePins) {
                try {
                    if (pin && typeof pin.free === "function")
                        pin.free();
                }
                catch (_) { }
            }
        }
    }
    function triggerRigSpam() {
        if (!mods.rigSpam)
            return;
        const now = unityNow();
        if (now < lastRigSpamAt + RIG_SPAM_COOLDOWN_SECONDS)
            return;
        if (!isLive(activeLocalPlayer))
            return;
        const localPlayer = strictLocalNetworkPlayer();
        if (!isUnityObjectAlive(localPlayer)) {
            rigSpamReportError("local NetworkPlayer was not found");
            return;
        }
        if (spawnRigDupeAtPlayer(localPlayer))
            lastRigSpamAt = now;
    }
    function pendingRigSpamPress() {
        triggerRigSpam();
    }
    function objectName(value) {
        try {
            const name = value.method("get_name", 0).invoke();
            return String(name && name.content !== undefined ? name.content : name);
        }
        catch (_) {
            return "";
        }
    }
    function pointerTouchButton(player) {
        if (!ensureMenuPointer(player))
            return "";
        try {
            const pointerPosition = getTransform(menuPointer).method("get_position", 0).invoke();
            const px = Number(pointerPosition.field("x").value);
            const py = Number(pointerPosition.field("y").value);
            const pz = Number(pointerPosition.field("z").value);
            const pointerWorldPosition = [px, py, pz];
            // Only real ball-to-button contact counts. There is no camera ray,
            // virtual fingertip, nearest-button fallback, or trigger press.
            let touchedId = "";
            let touchedDistance = MENU_POINTER_TOUCH_RADIUS;
            let touchedPageId = "";
            let touchedPageDistance = MENU_POINTER_TOUCH_RADIUS;
            for (const button of renderedButtons) {
                if (!isLive(button.object) || !isLive(button.collider))
                    continue;
                try {
                    const closest = button.collider.method("ClosestPoint", 1)
                        .invoke(pointerWorldPosition);
                    const dx = Number(closest.field("x").value) - px;
                    const dy = Number(closest.field("y").value) - py;
                    const dz = Number(closest.field("z").value) - pz;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    if (button.entry.pageDelta !== undefined) {
                        if (distance <= touchedPageDistance) {
                            touchedPageDistance = distance;
                            touchedPageId = button.entry.id;
                        }
                    }
                    else if (distance <= touchedDistance) {
                        touchedDistance = distance;
                        touchedId = button.entry.id;
                    }
                }
                catch (_) { }
            }
            return touchedPageId || touchedId;
        }
        catch (_) {
            return "";
        }
    }
    function refreshButtonColors(nextHoveredId) {
        if (nextHoveredId === hoveredButtonId)
            return;
        hoveredButtonId = nextHoveredId;
        for (const button of renderedButtons) {
            setRendererColor(button.renderer, buttonColor(button.entry, button.entry.id === hoveredButtonId));
        }
    }
    function playerFromWeaponOwner(weapon) {
        if (!isUnityObjectAlive(weapon))
            return null;
        const ownerCandidates = [
            "Owner",
            "owner",
            "<Owner>k__BackingField",
            "ownerPlayer",
            "currentPlayer",
            "_ownerPlayer",
        ];
        for (const candidate of ownerCandidates) {
            try {
                const owner = weapon.field(candidate).value;
                if (isUnityObjectAlive(owner))
                    return owner;
            }
            catch (_) { }
        }
        const getterCandidates = ["get_Owner", "get_owner", "get_CurrentPlayer", "get_OwnerPlayer", "get_EquippingPlayer"];
        for (const candidate of getterCandidates) {
            try {
                const owner = weapon.method(candidate, 0).invoke();
                if (isUnityObjectAlive(owner))
                    return owner;
            }
            catch (_) { }
        }
        return activeLocalPlayer;
    }
    function isPotentialPlayerContainer(value) {
        if (!isUnityObjectAlive(value))
            return false;
        try {
            return value.class && /NetworkPlayer|DLARX/.test(String(value.class.fullName || value.class.name || ""));
        }
        catch (_) {
            return false;
        }
    }
    function extractUnityObject(value) {
        try {
            if (!isUnityObjectAlive(value))
                return null;
            if (!value.class || !value.handle)
                return null;
            return value;
        }
        catch (_) {
            return null;
        }
    }
    function tryReadStreakFromField(scope, name) {
        if (!isUnityObjectAlive(scope))
            return;
        try {
            const field = scope.field(name);
            return field.value;
        }
        catch (_) {
            return null;
        }
    }
    function setNumericField(scope, name, value) {
        if (!isUnityObjectAlive(scope))
            return false;
        try {
            const field = scope.field(name);
            const current = Number(field.value);
            if (!Number.isFinite(current))
                return false;
            field.value = value;
            return true;
        }
        catch (_) {
            return false;
        }
    }
    function zeroOutCandidateNumber(value, visited) {
        if (!isUnityObjectAlive(value))
            return false;
        const key = String(value.handle);
        if (visited.has(key))
            return false;
        visited.add(key);
        let clearedAny = false;
        let changed = false;
        const names = [
            "Streak",
            "KillStreak",
            "CurrentStreak",
            "CurrentKillStreak",
            "Combo",
            "ComboCount",
            "ConsecutiveKills",
            "KillCombo",
            "HighestCombo",
            "KillsWithoutDeath",
            "ScoreMultiplier",
            "StreakMultiplier",
            "<Streak>k__BackingField",
            "<KillStreak>k__BackingField",
            "<CurrentStreak>k__BackingField",
            "<Combo>k__BackingField",
            "<ComboCount>k__BackingField",
            "<ConsecutiveKills>k__BackingField",
            "<KillCombo>k__BackingField",
            "<StreakMultiplier>k__BackingField",
        ];
        for (const name of names) {
            try {
                const field = value.field(name);
                const raw = field.value;
                const numeric = numericValue(raw);
                if (!Number.isFinite(numeric))
                    continue;
                if (numeric !== 0) {
                    field.value = 0;
                    changed = true;
                    clearedAny = true;
                }
                else if (numeric === 0) {
                    clearedAny = true;
                }
            }
            catch (_) { }
        }
        const methods = [
            "ResetStreak",
            "ResetKillStreak",
            "ClearStreak",
            "ResetCombo",
            "ResetCurrentStreak",
            "SetStreak",
            "SetKillStreak",
            "SetCombo",
            "SetComboCount",
        ];
        for (const methodName of methods) {
            try {
                const method = value.class.method(methodName, 1);
                if (method.returnType.name !== "System.Void" && method.returnType.name !== "System.Boolean")
                    continue;
                if (method.parameterCount === 0) {
                    try {
                        method.invoke(value);
                        changed = true;
                    }
                    catch (_) { }
                }
                else if (method.parameterCount === 1) {
                    try {
                        method.invoke(value, 0);
                        changed = true;
                    }
                    catch (_) { }
                }
            }
            catch (_) {
                try {
                    const method = value.method(methodName, 0);
                    if (method.parameterCount === 0) {
                        method.invoke(value);
                        changed = true;
                    }
                }
                catch (_) { }
            }
            if (changed)
                clearedAny = true;
        }
        if (!changed) {
            for (const childName of ["streakManager", "streakData", "streakState", "stats", "scoreState", "playerStats"]) {
                const child = tryReadStreakFromField(value, childName);
                if (isUnityObjectAlive(child) && isPotentialPlayerContainer(child)) {
                    if (zeroOutCandidateNumber(child, visited))
                        clearedAny = true;
                }
            }
        }
        return clearedAny;
    }
    function clearStreakForPlayer(player) {
        if (!isUnityObjectAlive(player))
            return false;
        let cleared = false;
        if (!player.class || !isPotentialPlayerContainer(player))
            return false;
        const nestedNames = ["streakManager", "streakData", "stats", "score", "playerStats", "comboData", "_streakManager", "_streakData", "_stats"];
        for (const name of nestedNames) {
            const nested = tryReadStreakFromField(player, name);
            if (isUnityObjectAlive(nested)) {
                if (zeroOutCandidateNumber(nested, new Set()))
                    cleared = true;
            }
        }
        const directFields = [
            "Streak",
            "KillStreak",
            "CurrentStreak",
            "Combo",
            "ComboCount",
            "ConsecutiveKills",
            "KillCombo",
        ];
        for (const fieldName of directFields) {
            try {
                if (setNumericField(player, fieldName, 0))
                    cleared = true;
            }
            catch (_) { }
        }
        for (const methodName of ["ResetStreak", "ClearStreak", "ResetKillStreak", "ClearKillStreak", "RemoveStreak"]) {
            try {
                const method = player.method(methodName, 0);
                if (method.returnType.name !== "System.Void" && method.returnType.name !== "System.Boolean")
                    continue;
                method.invoke(player);
                cleared = true;
            }
            catch (_) { }
        }
        if (!cleared) {
            if (zeroOutCandidateNumber(player, new Set()))
                cleared = true;
        }
        return cleared;
    }
    function findAimedPlayerForRemoveStreak(player) {
        const players = objectsOfClass(NetworkPlayer);
        if (players.length === 0)
            return null;
        const hand = getRightHandTransform(player);
        if (!isUnityObjectAlive(hand))
            return null;
        const origin = transformPosition(hand);
        if (!origin)
            return null;
        let forward;
        try {
            forward = vector3Value(hand.method("get_forward", 0).invoke());
        }
        catch (_) {
            forward = null;
        }
        if (!forward)
            return null;
        const magnitude = Math.sqrt(forward[0] * forward[0] + forward[1] * forward[1] + forward[2] * forward[2]) || 1.0;
        forward = [forward[0] / magnitude, forward[1] / magnitude, forward[2] / magnitude];
        let best = null;
        let bestScore = 0;
        try {
            const ray = castVfxGunRay(player, origin, forward, REMOVE_STREAK_MAX_RANGE);
            if (ray && ray.object) {
                for (const candidate of players) {
                    const roots = visualHierarchyRoots(candidate);
                    if (objectIsWithinRoots(ray.object, roots)) {
                        return candidate;
                    }
                }
            }
            for (const candidate of players) {
                if (isLocalNetworkTarget(candidate, player))
                    continue;
                const destination = networkPlayerHeadPosition(candidate);
                if (!destination)
                    continue;
                const toTarget = [
                    destination[0] - origin[0],
                    destination[1] - origin[1],
                    destination[2] - origin[2],
                ];
                const distanceSq = toTarget[0] * toTarget[0] + toTarget[1] * toTarget[1] + toTarget[2] * toTarget[2];
                if (!Number.isFinite(distanceSq) || distanceSq <= 0.1)
                    continue;
                const length = Math.sqrt(distanceSq);
                if (length > REMOVE_STREAK_MAX_RANGE)
                    continue;
                const dot = (toTarget[0] * forward[0] + toTarget[1] * forward[1] + toTarget[2] * forward[2]) / length;
                if (dot <= 0.55)
                    continue;
                const score = dot / length;
                if (best === null || score > bestScore) {
                    best = candidate;
                    bestScore = score;
                }
            }
        }
        catch (_) {
            return null;
        }
        return best;
    }
    function attemptRemoveStreakShot() {
        if (!mods.removeStreakGun)
            return;
        const now = unityNow();
        if (now - removeStreakLastAttempt < REMOVE_STREAK_TRIGGER_COOLDOWN)
            return;
        const owner = isUnityObjectAlive(activeLocalPlayer) ? activeLocalPlayer : null;
        const target = findAimedPlayerForRemoveStreak(owner);
        if (!isUnityObjectAlive(target))
            return;
        removeStreakLastAttempt = now;
        if (clearStreakForPlayer(target)) {
            const local = isUnityObjectAlive(activeLocalPlayer) ? activeLocalPlayer : null;
            const targetIndex = String(visualObjectKey(target));
            if (isUnityObjectAlive(local) && targetIndex)
                console.log("[" + MENU_NAME + "] Remove Streak Gun cleared streak on " + targetIndex + ".");
        }
    }
    function setToggle(toggle, enabled) {
        if (mods[toggle] === enabled)
            return;
        mods[toggle] = enabled;
        if (toggle === "infiniteAmmo" && enabled)
            pendingAmmoSweep = true;
        if ((toggle === "noCooldown" || toggle === "rapidFire") && enabled) {
            pendingCooldownReset = true;
            cooldownResetRetryFrame = frameNumber;
        }
        if (toggle === "unlockAll") {
            pendingUnlockRefresh = true;
            if (!enabled) {
                unlockTransitionRestorePending = false;
                unlockTransitionCosmetics = [];
                unlockTransitionStableFrames = 0;
                unlockTransitionRestoreAttempts = 0;
                unlockTransitionSourcePlayerKey = "";
                unlockTransitionConfirmedContentTypes.clear();
                unlockTransitionWeapons = null;
                try {
                    if (unlockTransitionWeaponsPin)
                        unlockTransitionWeaponsPin.free();
                }
                catch (_) { }
                unlockTransitionWeaponsPin = null;
            }
            // One deferred pass is enough to catch UI rows created by the
            // toggle. Rebuilding every catalog view six times caused a large
            // burst of Unity object deletion on the current Quest build.
            unlockRefreshFrames = enabled ? [frameNumber + 60] : [];
            refreshClipboardLobbyAccess();
            console.log(enabled
                ? "[" + MENU_NAME + "] Unlock All is active, including hidden weapon prefabs and appearances. " +
                    "Room changes preserve and automatically reapply the temporary weapon and cosmetic loadout; " +
                    "account entitlements are unchanged."
                : "[" + MENU_NAME + "] Unlock All is disabled; temporary hidden catalog entries were restored.");
        }
        if (toggle === "invincibility") {
            pendingInvincibilityRefresh = !setGodMode(enabled);
        }
        if (toggle === "speedBoost" && !enabled)
            restoreSpeedBoost();
        if (toggle === "joystickFly" && !enabled)
            restoreJoystickFly();
        if (toggle === "longArms" && !enabled)
            restoreLongArms();
        if (toggle === "platforms" && !enabled)
            clearPlatforms();
        if (toggle === "invisibility" && !enabled)
            restoreInvisibility();
        if (toggle === "tracers" && !enabled)
            clearTracers();
        if (toggle === "chams" && !enabled)
            restoreChams();
        if (toggle === "extendHitboxes" && !enabled)
            restoreExtendHitboxes();
        if (toggle === "aimbot" && !enabled) {
            aimbotTarget = null;
            aimbotTargetRefreshFrame = -1000;
            aimbotTargetPoint = null;
            aimbotTargetPointFrame = -1000;
            aimbotVisualRefreshFrame = -1000;
            aimbotAimTransformCache.clear();
        }
        if (toggle === "killInLobby") {
            syncLobbyWeaponDamageGate();
            refreshClipboardLobbyAccess();
        }
        if (toggle === "spinBot" && !enabled)
            restoreRigSpin();
        if (toggle === "rigSpam") {
            if (enabled) {
                lastRigSpamAt = -1000.0;
                console.log("[" + MENU_NAME + "] Rig Spam SS armed: press B on the right controller.");
            }
            else {
                lastRigSpamAt = 0.0;
                clearRigSpamClones();
            }
        }
        if (toggle === "removeStreakGun" && enabled)
            console.log("[" + MENU_NAME + "] Remove Streak Gun armed. Shoot a player to clear their streak.");
        if (toggle === "titleSpam") {
            if (enabled) {
                lastTitleSpamAt = -1000.0;
                titleSpamIndex = Math.floor(Math.random() * ANIMAL_RIVALS_TITLES.length);
                console.log("[" + MENU_NAME + "] Rank Spam armed - cycling temporary rank labels rapidly.");
            }
        }
        if (toggle === "showHp" && !enabled)
            clearHpLabels();
        if (toggle === "showHitboxes" && !enabled)
            clearHitboxVisuals();
        if (toggle === "vfxGun") {
            if (enabled) {
                vfxGunNextShotAt = unityNow();
                vfxGunDispatchUnavailableUntil = -1000.0;
                vfxGunFailureCount = 0;
                vfxGunVisualRetryAt = -1000.0;
                spawnGunTriggerWasPressed = false;
                ensureSpawnPrefabCatalog();
            }
            else {
                spawnGunTriggerWasPressed = false;
                destroyVfxGunVisuals();
            }
        }
        console.log("[" + MENU_NAME + "] " + toggle + "=" + enabled);
    }
    function runAction(action) {
        const now = unityNow();
        const last = lastOverpoweredActionAt.get(action) ?? -1000.0;
        const cooldown = action === "nuke" ? NUKE_ACTION_COOLDOWN : OVERPOWERED_ACTION_COOLDOWN;
        if (now - last < cooldown)
            return;
        if (action === "nuke") {
            if (queueNuke())
                lastOverpoweredActionAt.set(action, now);
            return;
        }
        if (action === "rigSpinSpeedUp") {
            rigSpinCurrentSpeed = Math.min(RIG_SPIN_SPEED_MAX, rigSpinCurrentSpeed + RIG_SPIN_SPEED_STEP);
            if (rigSpinCurrentSpeed !== rigSpinCurrentSpeed || Number.isNaN(rigSpinCurrentSpeed))
                rigSpinCurrentSpeed = RIG_SPIN_SPEED_MIN;
            buildMenu();
            return;
        }
        if (action === "rigSpinSpeedDown") {
            rigSpinCurrentSpeed = Math.max(RIG_SPIN_SPEED_MIN, rigSpinCurrentSpeed - RIG_SPIN_SPEED_STEP);
            if (rigSpinCurrentSpeed !== rigSpinCurrentSpeed || Number.isNaN(rigSpinCurrentSpeed))
                rigSpinCurrentSpeed = RIG_SPIN_SPEED_MIN;
            buildMenu();
            return;
        }
        lastOverpoweredActionAt.set(action, now);
        if (action === "tpAll")
            teleportAllToLocalPlayer();
        else if (action === "killAll")
            killAllPlayers();
        else if (action === "dumpThrowables")
            dumpThrowables();
        else if (action.startsWith("equipTitle:"))
            equipTitleById(action.slice("equipTitle:".length));
    }
    function activateButton(id) {
        const rendered = renderedButtons.find(button => button.entry.id === id);
        if (!rendered)
            return;
        const entry = rendered.entry;
        if (entry.disabled)
            return;
        if (entry.category) {
            currentCategory = entry.category;
            currentPage = 0;
        }
        else if (entry.back) {
            currentCategory = entry.backCategory || "Main";
            currentPage = 0;
        }
        else if (entry.pageDelta !== undefined) {
            const pageCount = menuPageCount(menuEntries().length);
            if (pageCount <= 1)
                return;
            currentPage = ((currentPage + entry.pageDelta) % pageCount + pageCount) % pageCount;
            console.log("[" + MENU_NAME + "] " + currentCategory + " page " +
                (currentPage + 1) + "/" + pageCount +
                (entry.pageDelta < 0 ? " (left)" : " (right)"));
        }
        else if (entry.soundIndex !== undefined)
            playSoundboardSound(entry.soundIndex);
        else if (entry.vfxSelector)
            cycleSelectedVfx(rightGrip ? -1 : 1);
        else if (entry.prefabIndex !== undefined) {
            selectSpawnPrefab(entry.prefabIndex);
            currentCategory = "Spawning";
            currentPage = 0;
        }
        else if (entry.prefabRefresh) {
            refreshSpawnPrefabCatalog();
            currentPage = 0;
        }
        else if (entry.grenadeSelector)
            cycleGrenadeVariant(1);
        else if (entry.action) {
            runAction(entry.action);
            // Action labels do not change. Keeping the existing menu avoids a
            // destroy/recreate allocation burst when a button is touched fast.
            return;
        }
        else if (entry.toggle)
            setToggle(entry.toggle, !mods[entry.toggle]);
        buildMenu();
    }
    function updateMenu(player) {
        if (!leftSecondary) {
            if (menuWasOpen) {
                destroyMenu();
                menuWasOpen = false;
            }
            menuPointerTouchArmed = true;
            menuPointerCooldownUntil = 0;
            menuBuildFaulted = false;
            menuRetryFrame = 0;
            return;
        }
        let openedThisFrame = false;
        if (!isUnityObjectAlive(menuRoot)) {
            if (menuBuildFaulted) {
                if (frameNumber < menuRetryFrame)
                    return;
                menuBuildFaulted = false;
            }
            if (!buildMenu())
                return;
            openedThisFrame = true;
            menuWasOpen = true;
            menuPointerTouchArmed = true;
        }
        recenterMenu(player);
        updateMenuTextFrontVisibility(player);
        const hitId = pointerTouchButton(player);
        refreshButtonColors(hitId);
        if (!hitId) {
            menuPointerTouchArmed = true;
        }
        else if (openedThisFrame) {
            // Opening while already overlapping a button should not click it.
            menuPointerTouchArmed = false;
        }
        else if (menuPointerTouchArmed && unityNow() >= menuPointerCooldownUntil) {
            menuPointerTouchArmed = false;
            menuPointerCooldownUntil = unityNow() + MENU_POINTER_DEBOUNCE_SECONDS;
            activateButton(hitId);
        }
    }
    function isGun(value) {
        if (!isLive(value))
            return false;
        try {
            return HitscanWeapon.isAssignableFrom(value.class) || ProjectileWeapon.isAssignableFrom(value.class);
        }
        catch (_) {
            return false;
        }
    }
    function sameObject(left, right) {
        if (!isLive(left) || !isLive(right))
            return false;
        try {
            return left.handle.equals(right.handle);
        }
        catch (_) {
            return false;
        }
    }
    function componentIsActiveInScene(component) {
        if (!isUnityObjectAlive(component))
            return false;
        try {
            const object = component.method("get_gameObject", 0).invoke();
            if (!isUnityObjectAlive(object) || !object.method("get_activeInHierarchy", 0).invoke())
                return false;
            return !!object.method("get_scene", 0).invoke().method("IsValid", 0).invoke();
        }
        catch (_) {
            return false;
        }
    }
    function controllerUsesMainCamera(player) {
        if (!componentIsActiveInScene(player))
            return false;
        try {
            const candidate = player.field("playerCamera").value;
            const main = Camera.method("get_main", 0).invoke();
            if (!isUnityObjectAlive(candidate))
                return false;
            if (!isUnityObjectAlive(main)) {
                try {
                    return componentIsActiveInScene(candidate) &&
                        !!candidate.method("get_enabled", 0).invoke();
                }
                catch (_) {
                    return false;
                }
            }
            if (sameObject(candidate, main))
                return true;
            return sameObject(getTransform(candidate), getTransform(main));
        }
        catch (_) {
            return false;
        }
    }
    function currentMannequinLockerManager() {
        if (!MannequinLockerManager)
            return null;
        try {
            const manager = MannequinLockerManager.field("Instance").value;
            if (isLive(manager))
                return manager;
        }
        catch (_) { }
        try {
            return objectsOfClass(MannequinLockerManager, true).find(isLive) || null;
        }
        catch (_) {
            return null;
        }
    }
    function managedStringDictionaryEntries(dictionary, maximum = UNLOCK_TRANSITION_MAX_COSMETICS) {
        const entries = [];
        if (!isLive(dictionary))
            return entries;
        try {
            const keys = dictionary.method("get_Keys", 0).invoke();
            const enumerator = keys.method("GetEnumerator", 0).invoke();
            for (let index = 0; index < maximum; index++) {
                if (!enumerator.method("MoveNext", 0).invoke())
                    break;
                const keyObject = enumerator.method("get_Current", 0).invoke();
                const contentType = managedStringContent(keyObject).trim();
                if (!contentType)
                    continue;
                let itemObject = null;
                try {
                    itemObject = dictionary.method("get_Item", 1)
                        .overload("System.String").invoke(keyObject);
                }
                catch (_) {
                    itemObject = dictionary.method("get_Item", 1).invoke(keyObject);
                }
                const itemId = managedStringContent(itemObject).trim();
                if (itemId)
                    entries.push({ contentType, itemId });
            }
        }
        catch (_) { }
        return entries;
    }
    function snapshotTransitionCosmetics() {
        const manager = currentMannequinLockerManager();
        if (!isLive(manager))
            return [];
        try {
            const equipped = manager.method("GetCachedCurrentlyEquippedItems", 0).invoke();
            return managedStringDictionaryEntries(equipped);
        }
        catch (_) {
            return [];
        }
    }
    function currentWeaponsManager() {
        if (!WeaponsManager)
            return null;
        try {
            const manager = WeaponsManager.method("get_Instance", 0).invoke();
            if (isLive(manager))
                return manager;
        }
        catch (_) { }
        try {
            const manager = WeaponsManager.field("Instance").value;
            if (isLive(manager))
                return manager;
        }
        catch (_) { }
        try {
            return objectsOfClass(WeaponsManager, true).find(componentIsActiveInScene) || null;
        }
        catch (_) {
            return null;
        }
    }
    function clearTransitionWeaponSnapshot() {
        unlockTransitionWeapons = null;
        try {
            if (unlockTransitionWeaponsPin)
                unlockTransitionWeaponsPin.free();
        }
        catch (_) { }
        unlockTransitionWeaponsPin = null;
    }
    function snapshotTransitionWeapons() {
        if (!WeaponsManager)
            return false;
        let current = null;
        try {
            current = WeaponsManager.method("GetActiveLoadoutWeaponsData", 0).invoke();
        }
        catch (_) {
            try {
                current = WeaponsManager.method("GetCachedPlayerWeaponsData", 0).invoke();
            }
            catch (_) { }
        }
        if (!isLive(current))
            return false;
        let copy = null;
        try {
            copy = WeaponsManager.method("CopyWeapons", 1).invoke(current);
        }
        catch (_) { }
        if (!isLive(copy))
            return false;
        clearTransitionWeaponSnapshot();
        try {
            unlockTransitionWeaponsPin = copy.ref(true);
        }
        catch (_) {
            return false;
        }
        unlockTransitionWeapons = copy;
        // Commit the active panel selection into the runtime cache before
        // Fusion begins tearing the player down. This does not write account
        // entitlements; it only keeps the selected prefab dictionary alive.
        try {
            const dictionaryType = "System.Collections.Generic.Dictionary<UITouchWeaponSlot.SlotType,DLAR_WeaponBase>";
            WeaponsManager.method("SetPlayerWeaponsDataCache", 1)
                .overload(dictionaryType).invoke(unlockTransitionWeapons);
        }
        catch (_) { }
        return true;
    }
    function restoreTransitionWeapons() {
        if (!isLive(unlockTransitionWeapons))
            return false;
        if (!WeaponsManager)
            return false;
        const dictionaryType = "System.Collections.Generic.Dictionary<UITouchWeaponSlot.SlotType,DLAR_WeaponBase>";
        try {
            WeaponsManager.method("SetPlayerWeaponsDataCache", 1)
                .overload(dictionaryType).invoke(unlockTransitionWeapons);
            return true;
        }
        catch (_) {
            return false;
        }
    }
    function prepareUnlockAllForRoomTransition(reason = "room/map transition") {
        const hadOverrides = mods.unlockAll || unlockViewFieldState.size > 0;
        const alreadyPending = unlockTransitionRestorePending;
        if (mods.unlockAll) {
            if (!alreadyPending)
                snapshotTransitionWeapons();
            const snapshot = snapshotTransitionCosmetics();
            if (snapshot.length > 0) {
                const byContentType = new Map(unlockTransitionCosmetics.map((entry) =>
                    [entry.contentType, entry]));
                for (const entry of snapshot)
                    byContentType.set(entry.contentType, entry);
                unlockTransitionCosmetics = Array.from(byContentType.values())
                    .slice(0, UNLOCK_TRANSITION_MAX_COSMETICS);
            }
            if (!alreadyPending) {
                unlockTransitionRestorePending = true;
                unlockTransitionRestoreNotBefore = Date.now() + UNLOCK_TRANSITION_RESTORE_DELAY_MS;
                unlockTransitionSamePlayerNotBefore = Date.now() + UNLOCK_TRANSITION_SAME_PLAYER_DELAY_MS;
                unlockTransitionSourcePlayerKey = isLive(activeLocalPlayer)
                    ? String(visualObjectKey(activeLocalPlayer))
                    : "";
                unlockTransitionStableFrames = 0;
                unlockTransitionRetryFrame = frameNumber;
                unlockTransitionRestoreAttempts = 0;
                unlockTransitionConfirmedContentTypes.clear();
            }
        }
        pendingUnlockRefresh = false;
        unlockRefreshFrames = [];
        // Restore scene-owned panel fields before those panels are destroyed,
        // then immediately reapply only the persistent catalog/backend state.
        // Keeping unlockAll enabled here prevents the next room's loadout
        // validation from replacing the selected weapons with the saved loadout.
        restoreUnlockViewFields();
        if (mods.unlockAll) {
            expandUnlockWeaponCatalog();
            setUnlockCatalogTesting();
        }
        if (hadOverrides && !alreadyPending) {
            console.log("[" + MENU_NAME + "] Unlock All preserved through " + reason +
                "; the new room will refresh its loadout UI automatically.");
        }
    }
    function resetSceneCaches() {
        // Locker presentation overrides belong to the scene that created the
        // panels. Restore them before releasing those wrappers so they cannot
        // leak into the next Fusion room's catalog/loadout validation.
        prepareUnlockAllForRoomTransition();
        pendingTeleportRepeats = [];
        pendingNukeGrenades = 0;
        nukeStalledFrames = 0;
        restoreRigSpin();
        titleNameTagTarget = null;
        titleNameTagSpawner = null;
        titleOriginalRankText = "";
        titleOriginalNetworkXp = null;
        titleNetworkPlayer = null;
        titleSpawnFallbackAt = -1000.0;
        titleNextErrorAt = -1000.0;
        restoreExtendHitboxes();
        clearRigSpamClones();
        rigSpamAvatarPrefabState = null;
        rigSpamVisibleLayer = null;
        aimbotTarget = null;
        aimbotTargetRefreshFrame = -1000;
        aimbotTargetPoint = null;
        aimbotTargetPointFrame = -1000;
        aimbotVisualRefreshFrame = -1000;
        heldWeaponsCacheFrame = -1000;
        heldWeaponsCache = [];
        aimbotAimTransformCache.clear();
        teamKeyCache.clear();
        restoreJoystickFly();
        restoreLongArms();
        restoreSpeedBoost();
        restoreInvisibility();
        clearPlatforms();
        clearVisuals();
        resetVfxGunSceneState();
        destroyMenu();
        cachedClipboardWeapon = null;
        cachedGrenadePrefab = null;
        cachedGrenadePrefabVariant = -1;
        cachedProjectileWeaponTemplate = null;
        grenadePrefabRetryAt = -1000.0;
        projectileWeaponTemplateRetryAt = -1000.0;
        lastVisualScanFrame = -1000;
        lastMatchModeScanFrame = -1000;
        cachedMatchModeActive = false;
        chamScanCursor = 0;
        rightSecondaryDown = false;
        rightSecondaryWasPressed = false;
        focusCleanupPending = false;
        menuWasOpen = false;
    }
    function applicationAllowsMenuTick() {
        localControllerFocusPoll++;
        if (localControllerFocusPoll % APPLICATION_FOCUS_POLL_CALLS !== 0) {
            return true;
        }
        try {
            cachedApplicationFocused = !!Application.method("get_isFocused", 0).invoke();
        }
        catch (_) {
            // If this Unity build does not expose the property, preserve the
            // normal in-game path instead of disabling the menu.
            cachedApplicationFocused = true;
        }
        if (!cachedApplicationFocused) {
            focusLostFrameCount += APPLICATION_FOCUS_POLL_CALLS;
            if (focusLostFrameCount >= APPLICATION_FOCUS_GRACE_FRAMES && isUnityObjectAlive(activeLocalPlayer)) {
                focusCleanupPending = true;
                focusLostFrameCount = 0;
                if (menuWasOpen)
                    destroyMenu();
                return false;
            }
            return true;
        }
        if (focusCleanupPending) {
            focusCleanupPending = false;
            resetSceneCaches();
        }
        focusLostFrameCount = 0;
        return true;
    }
    function shouldTickPlayerController(player) {
        const now = Date.now();
        const appAllowed = applicationAllowsMenuTick();
        if (isLive(activeLocalPlayer)) {
            if (!sameObject(player, activeLocalPlayer)) {
                // Multiplayer invokes this hook for every remote controller.
                // The cached local handle makes those callbacks a pointer-only
                // fast path instead of repeating Unity scene/camera calls.
                if (now - lastLocalControllerTickAt < LOCAL_CONTROLLER_STALE_MS)
                    return false;
            }
            else {
                lastLocalControllerTickAt = now;
                if (!appAllowed) {
                    focusCleanupPending = true;
                    return false;
                }
                if (now - lastLocalControllerValidationAt < LOCAL_CONTROLLER_RECHECK_MS)
                    return true;
                if (controllerUsesMainCamera(player)) {
                    lastLocalControllerValidationAt = now;
                    return true;
                }
                resetSceneCaches();
                activeLocalPlayer = null;
            }
        }
        if (!appAllowed) {
            if (isUnityObjectAlive(activeLocalPlayer))
                focusCleanupPending = true;
            return false;
        }
        if (!controllerUsesMainCamera(player))
            return false;
        if (isLive(activeLocalPlayer) && !sameObject(player, activeLocalPlayer))
            resetSceneCaches();
        activeLocalPlayer = player;
        lastLocalControllerTickAt = now;
        lastLocalControllerValidationAt = now;
        return true;
    }
    function getLocalHeldWeapons() {
        if (!isLive(activeLocalPlayer))
            return [];
        if (heldWeaponsCacheFrame === frameNumber)
            return heldWeaponsCache;
        const result = [];
        for (const methodName of ["GetPreferredHandWeapon", "GetOffHandWeapon"]) {
            try {
                const weapon = activeLocalPlayer.method(methodName, 0).invoke();
                if (!isLive(weapon))
                    continue;
                if (!result.some(existing => sameObject(existing, weapon)))
                    result.push(weapon);
            }
            catch (_) { }
        }
        heldWeaponsCacheFrame = frameNumber;
        heldWeaponsCache = result;
        return heldWeaponsCache;
    }
    function isLocalWeapon(weapon) {
        if (!isLive(weapon))
            return false;
        return getLocalHeldWeapons().some(localWeapon => sameObject(localWeapon, weapon));
    }
    function isLocalAmmoStorage(storage) {
        if (!isLive(storage))
            return false;
        try {
            return isLocalWeapon(storage.field("_weapon").value);
        }
        catch (_) {
            return false;
        }
    }
    function weaponSettings(weapon) {
        try {
            const settings = weapon.field("weaponSettings").value;
            return isLive(settings) ? settings : null;
        }
        catch (_) {
            return null;
        }
    }
    function topUpWeapon(weapon) {
        if (!isLive(weapon))
            return;
        try {
            const settings = weaponSettings(weapon);
            if (!settings)
                return;
            const magazine = Math.max(0, Math.trunc(Number(settings.field("MagazineCapacity").value)));
            const total = Math.max(magazine, Math.trunc(Number(settings.field("TotalAmmo").value)));
            if (magazine > 0)
                weapon.field("<currentAmmo>k__BackingField").value = magazine;
            if (total > 0)
                weapon.field("<currentTotalAmmo>k__BackingField").value = total;
        }
        catch (_) { }
    }
    function findObjects(klass) {
        if (!klass)
            return null;
        try {
            return UnityObject.method("FindObjectsByType", 2)
                .overload("System.Type", "UnityEngine.FindObjectsSortMode")
                .invoke(klass.type.object, 0);
        }
        catch (_) {
            try {
                return UnityObject.method("FindObjectsOfType", 1)
                    .overload("System.Type")
                    .invoke(klass.type.object);
            }
            catch (_) {
                return null;
            }
        }
    }
    function findResourceObjects(klass) {
        if (!klass)
            return null;
        try {
            return Resources.method("FindObjectsOfTypeAll", 1)
                .overload("System.Type")
                .invoke(klass.type.object);
        }
        catch (_) {
            return null;
        }
    }
    function findSceneObjectsIncludingInactive(klass) {
        if (!klass)
            return null;
        try {
            return UnityObject.method("FindObjectsByType", 3)
                .overload("System.Type", "UnityEngine.FindObjectsInactive", "UnityEngine.FindObjectsSortMode")
                .invoke(klass.type.object, 1, 0);
        }
        catch (_) {
            return null;
        }
    }
    function objectArrayValues(objects) {
        const values = [];
        try {
            for (let index = 0; objects && index < objects.length; index++) {
                const value = objects.get(index);
                if (isLive(value))
                    values.push(value);
            }
        }
        catch (_) { }
        return values;
    }
    function objectsOfClass(klass, includeInactive = false, includeAssets = false) {
        const values = objectArrayValues(findObjects(klass));
        if (includeInactive) {
            for (const value of objectArrayValues(findSceneObjectsIncludingInactive(klass))) {
                if (!values.some(existing => sameObject(existing, value)))
                    values.push(value);
            }
        }
        if (includeAssets) {
            for (const value of objectArrayValues(findResourceObjects(klass))) {
                if (!values.some(existing => sameObject(existing, value)))
                    values.push(value);
            }
        }
        return values;
    }
    function componentGameObject(component) {
        if (!isLive(component))
            return null;
        try {
            return component.method("get_gameObject", 0).invoke();
        }
        catch (_) {
            return null;
        }
    }
    function findClipboardWeapon() {
        const sceneCandidates = objectsOfClass(ClipboardWeapon, true);
        if (sceneCandidates.length > 0) {
            cachedClipboardWeapon = sceneCandidates[0];
            return cachedClipboardWeapon;
        }
        if (isLive(cachedClipboardWeapon))
            return cachedClipboardWeapon;
        const resourceCandidates = objectArrayValues(findResourceObjects(ClipboardWeapon));
        cachedClipboardWeapon = resourceCandidates.length > 0 ? resourceCandidates[0] : null;
        return cachedClipboardWeapon;
    }
    function setGodMode(enabled) {
        const local = NetworkPlayer
            ? findLocalNetworkPlayer(objectsOfClass(NetworkPlayer))
            : null;
        if (isUnityObjectAlive(local)) {
            let godHealth = 9997999;
            let maxHealth = 200;
            let currentHealth = Number.NaN;
            try {
                const configured = Number(ClipboardWeapon.field("GodModeHealth").value);
                if (Number.isFinite(configured) && configured > 0)
                    godHealth = Math.trunc(configured);
            }
            catch (_) { }
            try {
                const resolved = Number(local.method("GetMaxPlayerHealth", 0).invoke());
                if (Number.isFinite(resolved) && resolved > 0)
                    maxHealth = Math.trunc(resolved);
            }
            catch (_) { }
            try {
                currentHealth = Number(local.method("get_DLAR_Player_Health", 0).invoke());
            }
            catch (_) { }
            const desiredHealth = enabled ? godHealth : Math.max(1, maxHealth);
            const alreadyApplied = enabled
                ? Number.isFinite(currentHealth) && currentHealth >= godHealth
                : Number.isFinite(currentHealth) && currentHealth <= maxHealth;
            if (!alreadyApplied) {
                try {
                    local.method("set_DLAR_Player_Health", 1).invoke(desiredHealth);
                    local.method("OnVitalsChanged", 0).invoke();
                    local.method("RPC_UpdatePlayerUI", 0).invoke();
                }
                catch (_) { }
            }
            try {
                const appliedHealth = Number(local.method("get_DLAR_Player_Health", 0).invoke());
                if (enabled ? appliedHealth >= godHealth : appliedHealth <= maxHealth)
                    return true;
            }
            catch (_) { }
        }

        // Older builds route developer god mode through a live clipboard.
        // Never invoke the method on an inactive Resources prefab: the current
        // build has no scene clipboard unless one is actually equipped.
        const clipboard = objectsOfClass(ClipboardWeapon, true)
            .find(componentIsActiveInScene);
        if (!isUnityObjectAlive(clipboard))
            return false;
        try {
            const current = !!clipboard.method("IsGodModeEnabled", 0).invoke();
            if (current !== enabled)
                clipboard.method("ToggleGodMode", 0).invoke();
            return !!clipboard.method("IsGodModeEnabled", 0).invoke() === enabled;
        }
        catch (_) {
            return false;
        }
    }
    function methodBoolean(value, methodNames) {
        for (const methodName of methodNames) {
            try {
                return !!value.method(methodName, 0).invoke();
            }
            catch (_) { }
        }
        return null;
    }
    function networkObjectHasInputAuthority(player) {
        const direct = methodBoolean(player, [
            "get_HasInputAuthority",
            "get_IsLocalPlayer",
            "get_IsLocal",
            "get_IsMine",
        ]);
        if (direct !== null)
            return direct;
        try {
            const networkObject = player.method("get_Object", 0).invoke();
            if (isLive(networkObject)) {
                const authority = methodBoolean(networkObject, ["get_HasInputAuthority"]);
                if (authority !== null)
                    return authority;
            }
        }
        catch (_) { }
        return false;
    }
    function networkObjectHasStateAuthority(player) {
        const direct = methodBoolean(player, [
            "get_HasStateAuthority",
            "get_IsStateAuthority",
        ]);
        if (direct !== null)
            return direct;
        try {
            const networkObject = player.method("get_Object", 0).invoke();
            if (isLive(networkObject)) {
                const authority = methodBoolean(networkObject, [
                    "get_HasStateAuthority",
                    "get_IsStateAuthority",
                ]);
                if (authority !== null)
                    return authority;
            }
        }
        catch (_) { }
        return false;
    }
    function invokeNetworkTransformTeleport(networkTransform, position) {
        if (!isUnityObjectAlive(networkTransform))
            return false;
        const methods = [
            ["set_RBPosition", "set_rigidbodyPosition"],
            ["set_RBState", "set_rigidbodyState"],
            ["set_Position", "set_PositionRaw"],
            ["set_RBPosition", "set_PositionAndRotation", "set_position"],
            ["Teleport", "set_TeleportPosition", "Warp"],
            ["set_SimulatedPosition", "set_simulatedPosition"],
        ];
        for (const group of methods) {
            for (const name of group) {
                try {
                    const method = networkTransform.method(name, 1);
                    method.invoke(position);
                    return true;
                }
                catch (_) { }
                try {
                    const method = networkTransform.method(name, 2);
                    method.invoke(position, true);
                    return true;
                }
                catch (_) { }
            }
        }
        return false;
    }
    function invokePlayerTeleportMethod(player, position) {
        const methodNames = [
            "Teleport",
            "Warp",
            "SetPosition",
            "SetPlayerPosition",
            "SetPlayerTransform",
            "TeleportTo",
            "RPC_TeleportToPosition",
            "RequestTeleport",
            "SetTargetPosition",
            "TeleportPlayerToPosition",
            "SetPlayerPose",
            "RPC_Teleport",
        ];
        const identityRot = identityQuaternion;
        const buildArgs = (typeNames) => typeNames.map((typeName) => {
            if (/UnityEngine\.Vector3/i.test(typeName))
                return position;
            if (/UnityEngine\.Quaternion/i.test(typeName))
                return identityRot;
            if (/System\.Boolean/i.test(typeName))
                return false;
            if (/System\.(Single|Int\d*)/i.test(typeName))
                return 0;
            return 0;
        });
        const callIfVector3 = (method) => {
            try {
                const typeNames = (method.parameterTypes || []).map(type => String(type?.name || ""));
                const hasVector3 = typeNames.some(typeName => /UnityEngine\.Vector3/i.test(typeName));
                if (!hasVector3 || method.parameterCount <= 0 || method.parameterCount > 4)
                    return false;
                const args = buildArgs(typeNames);
                method.invoke(...args);
                return true;
            }
            catch (_) {
                return false;
            }
        };
        for (const name of methodNames) {
            try {
                const methods = player.methods || [];
                for (const method of methods) {
                    if (method.name !== name || method.virtualAddress.isNull())
                        continue;
                    if (callIfVector3(method))
                        return true;
                }
            }
            catch (_) { }
            try {
                const method = player.method(name, 1);
                if (callIfVector3(method))
                    return true;
            }
            catch (_) { }
        }
        return false;
    }
    function closestNetworkPlayerToLocal(players) {
        if (!isLive(activeLocalPlayer))
            return null;
        let localPosition = null;
        try {
            localPosition = getTransform(activeLocalPlayer).method("get_position", 0).invoke();
        }
        catch (_) {
            return null;
        }
        const lx = Number(localPosition.field("x").value);
        const ly = Number(localPosition.field("y").value);
        const lz = Number(localPosition.field("z").value);
        let closest = null;
        let closestDistance = Number.POSITIVE_INFINITY;
        for (const player of players) {
            try {
                const position = getTransform(player).method("get_position", 0).invoke();
                const dx = Number(position.field("x").value) - lx;
                const dy = Number(position.field("y").value) - ly;
                const dz = Number(position.field("z").value) - lz;
                const distance = dx * dx + dy * dy + dz * dz;
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closest = player;
                }
            }
            catch (_) { }
        }
        return closest;
    }
    function findLocalNetworkPlayer(players) {
        for (const glider of objectsOfClass(PlayerGlider)) {
            try {
                if (!sameObject(glider.field("player").value, activeLocalPlayer))
                    continue;
                const networkPlayer = glider.field("networkPlayer").value;
                if (isLive(networkPlayer))
                    return networkPlayer;
            }
            catch (_) { }
        }
        for (const player of players) {
            if (networkObjectHasInputAuthority(player))
                return player;
        }
        return closestNetworkPlayerToLocal(players);
    }
    function isLocalNetworkTarget(player, resolvedLocalPlayer) {
        return sameObject(player, resolvedLocalPlayer) || networkObjectHasInputAuthority(player);
    }
    function localBringPosition() {
        if (!isLive(activeLocalPlayer))
            return null;
        try {
            const position = getTransform(activeLocalPlayer).method("get_position", 0).invoke();
            return [
                Number(position.field("x").value),
                Number(position.field("y").value),
                Number(position.field("z").value),
            ];
        }
        catch (_) {
            return null;
        }
    }
    function invokeAuthoritativeTeleport(player, receiver, position) {
        if (!isLive(player))
            return false;
        if (!Array.isArray(position) || position.length < 3 || !position.every(Number.isFinite))
            return false;
        if (AdminTeleport && isLive(receiver)) {
            try {
                const networkObject = player.method("get_Object", 0).invoke();
                if (isLive(networkObject)) {
                    const inputAuthority = networkObject.method("get_InputAuthority", 0).invoke();
                    receiver.method("RPC_TeleportPlayerToPosition", 2)
                        .overload("Fusion.PlayerRef", "UnityEngine.Vector3")
                        .invoke(inputAuthority, position);
                    return true;
                }
            }
            catch (_) { }
        }
        const hasStateAuthority = networkObjectHasStateAuthority(player);
        if (hasStateAuthority) {
            try {
                const networkTransform = NetworkPlayer.field("networkTransform").bind(player).value;
                if (isUnityObjectAlive(networkTransform) &&
                    invokeNetworkTransformTeleport(networkTransform, position)) {
                    return true;
                }
            }
            catch (_) { }
        }
        if (hasStateAuthority && invokePlayerTeleportMethod(player, position))
            return true;
        if (!hasStateAuthority && invokePlayerTeleportMethod(player, position))
            return true;
        if (hasStateAuthority) {
            // Last resort: try the player's transform and rigidbody direct
            // manipulation to keep local overrides while the state authority
            // refresh window settles.
            try {
                const transform = getTransform(player);
                transform.method("set_position", 1).invoke(position);
                return true;
            }
            catch (_) { }
        }
        return false;
    }
    function updatePendingTeleportRepeats() {
        if (pendingTeleportRepeats.length === 0)
            return;
        const remaining = [];
        for (const pending of pendingTeleportRepeats) {
            if (frameNumber < pending.nextFrame) {
                remaining.push(pending);
                continue;
            }
            invokeAuthoritativeTeleport(pending.player, pending.receiver, pending.position);
            pending.repeatsLeft = Math.max(0, pending.repeatsLeft - 1);
            if (pending.repeatsLeft > 0 && isLive(pending.player)) {
                pending.nextFrame = frameNumber + TP_ALL_REPEAT_INTERVAL_FRAMES;
                remaining.push(pending);
            }
        }
        pendingTeleportRepeats = remaining;
    }
    function teleportAllToLocalPlayer() {
        const now = unityNow();
        if (now < tpAllCooldownUntil) {
            console.log("[" + MENU_NAME + "] TP All cooldown active.");
            return;
        }
        pendingTeleportRepeats = [];
        const players = objectsOfClass(NetworkPlayer);
        const localPlayer = findLocalNetworkPlayer(players);
        const origin = localBringPosition();
        if (!origin) {
            console.error("[" + MENU_NAME + "] TP All failed: local player position is unavailable.");
            return;
        }
        tpAllCooldownUntil = now + TP_ALL_COOLDOWN_SECONDS;
        let rpc = null;
        try {
            rpc = AdminTeleport?.method("RPC_TeleportPlayerToPosition", 2)
                .overload("Fusion.PlayerRef", "UnityEngine.Vector3");
        }
        catch (_) { }
        // A spawned scene receiver is required for the instance RPC. If none is
        // live, invokeAuthoritativeTeleport can still use an owned Fusion body.
        const receiver = rpc ? (objectsOfClass(AdminTeleport, true)[0] ?? null) : null;
        let teleported = 0;
        let skippedNoAuthority = 0;
        let remoteIndex = 0;
        for (const player of players) {
            if (isLocalNetworkTarget(player, localPlayer))
                continue;
            const destination = [
                origin[0],
                origin[1] + 0.03 + remoteIndex * 0.04,
                origin[2],
            ];
            if (invokeAuthoritativeTeleport(player, receiver, destination)) {
                teleported++;
                // Repeat several times to survive short replication rollbacks.
                pendingTeleportRepeats.push({
                    player,
                    receiver,
                    position: destination,
                    nextFrame: frameNumber + TP_ALL_REPEAT_INTERVAL_FRAMES,
                    repeatsLeft: TP_ALL_REPEATS,
                });
            }
            else
                skippedNoAuthority++;
            remoteIndex++;
        }
        const summary = "TP All moved " + teleported + " player(s); skipped " +
            skippedNoAuthority + " without admin/state authority.";
        if (teleported > 0)
            console.log("[" + MENU_NAME + "] " + summary);
        else
            console.error("[" + MENU_NAME + "] " + summary);
    }
    function killAllPlayers() {
        const clipboard = findClipboardWeapon();
        if (!isLive(clipboard)) {
            console.error("[" + MENU_NAME + "] Kill All failed: the admin clipboard service is unavailable.");
            return;
        }
        const players = objectsOfClass(NetworkPlayer);
        const localPlayer = findLocalNetworkPlayer(players);
        let previousSelection = null;
        try {
            previousSelection = clipboard.method("get_SelectedPlayer", 0).invoke();
        }
        catch (_) { }
        let killed = 0;
        try {
            for (const player of players) {
                if (isLocalNetworkTarget(player, localPlayer))
                    continue;
                try {
                    let valid = true;
                    try {
                        valid = !!ClipboardWeapon.method("IsPlayerValid", 1).invoke(player);
                    }
                    catch (_) { }
                    if (!valid)
                        continue;
                    clipboard.method("SetSelectedPlayer", 1).invoke(player);
                    clipboard.method("KillSelectedPlayer", 0).invoke();
                    killed++;
                }
                catch (_) { }
            }
        }
        finally {
            if (isLive(previousSelection)) {
                try {
                    clipboard.method("SetSelectedPlayer", 1).invoke(previousSelection);
                }
                catch (_) { }
            }
        }
        console.log("[" + MENU_NAME + "] Kill All targeted " + killed + " player(s).");
    }
    function grenadeNameLooksUsable(name) {
        const lower = name.toLowerCase();
        return lower.includes("grenade") && !lower.includes("smoke") &&
            !lower.includes("visual") && !lower.includes("vfx");
    }
    function dumpThrowables() {
        const pattern = /(grenade|bomb|projectile|throwable|explosive|mine|rocket|molotov|flash|smoke)/i;
        const entries = new Map();
        const addEntry = (value, source) => {
            if (!isUnityObjectAlive(value))
                return;
            const object = componentGameObject(value) || value;
            const name = objectName(object);
            if (!pattern.test(name))
                return;
            let className = "GameObject";
            try {
                className = String(value.class.fullName || value.class.name || className);
            }
            catch (_) { }
            entries.set(className + " | " + name, source);
        };
        for (const object of objectArrayValues(findResourceObjects(GameObject)))
            addEntry(object, "GameObject");
        for (const className of ["Deadeye.Throwables.GrenadeProjectile", "GrenadeProjectile", "GrenadeLauncher"]) {
            const klass = resolveClass(className);
            if (!klass)
                continue;
            for (const value of objectArrayValues(findResourceObjects(klass)))
                addEntry(value, className);
        }
        console.log("[" + MENU_NAME + "] Throwable dump: " + entries.size + " match(es).");
        for (const [entry, source] of [...entries.entries()].sort((left, right) => left[0].localeCompare(right[0])))
            console.log("[" + MENU_NAME + "] THROWABLE [" + source + "] " + entry);
    }
    function findGrenadePrefab() {
        if (cachedGrenadePrefabVariant === selectedGrenadeVariant && isUnityObjectAlive(cachedGrenadePrefab))
            return cachedGrenadePrefab;
        cachedGrenadePrefab = null;
        const now = unityNow();
        if (now < grenadePrefabRetryAt)
            return null;
        const variant = getCurrentGrenadeVariant();
        const prefabNames = new Set((variant.prefabNames || [])
            .map(name => String(name).toLowerCase()));
        const matchesVariant = (value) => {
            if (!isUnityObjectAlive(value))
                return false;
            const normalized = objectName(value).replace(/\(Clone\)$/i, "").trim().toLowerCase();
            return prefabNames.has(normalized);
        };
        for (const resourcePath of variant.resourcePaths) {
            try {
                const loaded = Resources.method("Load", 2)
                    .overload("System.String", "System.Type")
                    .invoke(Il2Cpp.string(resourcePath), GameObject.type.object);
                if (isUnityObjectAlive(loaded)) {
                    cachedGrenadePrefab = loaded;
                    cachedGrenadePrefabVariant = selectedGrenadeVariant;
                    return cachedGrenadePrefab;
                }
            }
            catch (_) { }
        }
        for (const launcher of objectsOfClass(GrenadeLauncher, true, false)) {
            try {
                const prefab = launcher.method("GetProjectilePrefab", 0).invoke();
                if (matchesVariant(prefab)) {
                    cachedGrenadePrefab = prefab;
                    cachedGrenadePrefabVariant = selectedGrenadeVariant;
                    return cachedGrenadePrefab;
                }
            }
            catch (_) { }
        }
        for (const className of variant.classNames) {
            const projectileClass = resolveClass(className);
            if (!projectileClass)
                continue;
            for (const projectile of objectArrayValues(findResourceObjects(projectileClass))) {
                const object = componentGameObject(projectile);
                if (!isUnityObjectAlive(object))
                    continue;
                if (matchesVariant(object)) {
                    cachedGrenadePrefab = object;
                    cachedGrenadePrefabVariant = selectedGrenadeVariant;
                    return cachedGrenadePrefab;
                }
            }
        }
        for (const object of objectArrayValues(findResourceObjects(GameObject))) {
            if (matchesVariant(object)) {
                cachedGrenadePrefab = object;
                cachedGrenadePrefabVariant = selectedGrenadeVariant;
                return cachedGrenadePrefab;
            }
        }
        grenadePrefabRetryAt = now + GRENADE_PREFAB_RETRY_SECONDS;
        return null;
    }
    function invokeProjectileLaunch(weapon, direction, extraVelocity) {
        if (!projectileLaunchMethod || !isUnityObjectAlive(weapon))
            return false;
        const bound = projectileLaunchMethod.bind(weapon);
        if (projectileLaunchMethod.parameterCount === 3) {
            const launchOrigin = getTransform(weapon);
            if (!isUnityObjectAlive(launchOrigin))
                return false;
            bound.invoke(direction, extraVelocity, launchOrigin);
        }
        else {
            bound.invoke(direction, extraVelocity);
        }
        return true;
    }
    function launchGrenadeThroughHeldWeapon(prefab, direction) {
        for (const weapon of getLocalHeldWeapons()) {
            try {
                if (!ProjectileWeapon.isAssignableFrom(weapon.class))
                    continue;
                const overrideField = weapon.field("overrideProjectilePrefab");
                const previousOverride = overrideField.value;
                try {
                    weapon.method("SetOverrideProjectilePrefab", 1).invoke(prefab);
                    if (invokeProjectileLaunch(weapon, direction, [0, 0, 0]))
                        return true;
                }
                finally {
                    try {
                        weapon.method("SetOverrideProjectilePrefab", 1).invoke(previousOverride);
                    }
                    catch (_) { }
                }
            }
            catch (_) { }
        }
        return false;
    }
    function findProjectileWeaponTemplate() {
        if (isUnityObjectAlive(cachedProjectileWeaponTemplate))
            return cachedProjectileWeaponTemplate;
        cachedProjectileWeaponTemplate = null;
        const now = unityNow();
        if (now < projectileWeaponTemplateRetryAt)
            return null;
        const candidates = objectArrayValues(findResourceObjects(ProjectileWeapon));
        const preferred = candidates.find(candidate => {
            const name = objectName(componentGameObject(candidate)).toLowerCase();
            return name.includes("basketballlauncher") || name.includes("basketball launcher");
        });
        cachedProjectileWeaponTemplate = preferred ?? candidates.find(candidate => isLive(componentGameObject(candidate))) ?? null;
        if (!isUnityObjectAlive(cachedProjectileWeaponTemplate)) {
            projectileWeaponTemplateRetryAt = now + GRENADE_TEMPLATE_RETRY_SECONDS;
        }
        else {
            projectileWeaponTemplateRetryAt = -1000.0;
        }
        return cachedProjectileWeaponTemplate;
    }
    function launchGrenadeThroughTemplate(prefab, hand, direction) {
        const template = findProjectileWeaponTemplate();
        const templateObject = componentGameObject(template);
        if (!isLive(templateObject))
            return false;
        let clone = null;
        try {
            const position = hand.method("get_position", 0).invoke();
            const rotation = hand.method("get_rotation", 0).invoke();
            clone = UnityObject.method("Instantiate", 3)
                .overload("UnityEngine.Object", "UnityEngine.Vector3", "UnityEngine.Quaternion")
                .invoke(templateObject, position, rotation);
            if (!isLive(clone))
                return false;
            try {
                clone.method("SetActive", 1).invoke(true);
            }
            catch (_) { }
            let weapon = getComponent(clone, ProjectileWeapon);
            if (!isLive(weapon)) {
                try {
                    weapon = clone.method("GetComponentInChildren", 2)
                        .overload("System.Type", "System.Boolean")
                        .invoke(ProjectileWeapon.type.object, true);
                }
                catch (_) { }
            }
            if (!isLive(weapon))
                return false;
            weapon.method("SetOverrideProjectilePrefab", 1).invoke(prefab);
            return invokeProjectileLaunch(weapon, direction, [0, 0, 0]);
        }
        catch (_) {
            return false;
        }
        finally {
            if (isLive(clone))
                destroy(clone);
        }
    }
    function launchGrenadeFromHand(player, bypassCooldown = false, bulkLaunch = false) {
        const now = unityNow();
        if (!bypassCooldown && now - lastGrenadeLaunchTime < GRENADE_LAUNCH_COOLDOWN)
            return false;
        // Reserve the slot before any expensive lookup or spawn attempt so a
        // missing prefab/exception cannot retry on every LateUpdate while held.
        lastGrenadeLaunchTime = now;
        const hand = getRightHandTransform(player);
        const prefab = findGrenadePrefab();
        if (!isUnityObjectAlive(hand) || !isUnityObjectAlive(prefab)) {
            if (now - lastGrenadePrefabWarningTime >= 1.0) {
                lastGrenadePrefabWarningTime = now;
                console.error("[" + MENU_NAME + "] Grenade Launcher is waiting for the " +
                    getCurrentGrenadeVariant().name + " prefab.");
            }
            return false;
        }
        try {
            const forwardValue = hand.method("get_forward", 0).invoke();
            const direction = [
                Number(forwardValue.field("x").value),
                Number(forwardValue.field("y").value),
                Number(forwardValue.field("z").value),
            ];
            if (launchGrenadeThroughHeldWeapon(prefab, direction)) {
                return true;
            }
            // A temporary weapon clone is acceptable for one normal shot but
            // wasteful for a 50-projectile burst. Nuke falls through to the
            // direct prefab path when no held projectile weapon is available.
            if (!bulkLaunch && launchGrenadeThroughTemplate(prefab, hand, direction)) {
                return true;
            }
            const handPosition = hand.method("get_position", 0).invoke();
            const position = [
                Number(handPosition.field("x").value) + direction[0] * 0.22,
                Number(handPosition.field("y").value) + direction[1] * 0.22,
                Number(handPosition.field("z").value) + direction[2] * 0.22,
            ];
            const rotation = hand.method("get_rotation", 0).invoke();
            const grenade = UnityObject.method("Instantiate", 3)
                .overload("UnityEngine.Object", "UnityEngine.Vector3", "UnityEngine.Quaternion")
                .invoke(prefab, position, rotation);
            if (!isLive(grenade))
                throw new Error("Unity returned no grenade instance");
            try {
                grenade.method("SetActive", 1).invoke(true);
            }
            catch (_) { }
            let rigidbody = getComponent(grenade, Rigidbody);
            if (!isLive(rigidbody)) {
                try {
                    rigidbody = grenade.method("GetComponentInChildren", 2)
                        .overload("System.Type", "System.Boolean")
                        .invoke(Rigidbody.type.object, true);
                }
                catch (_) { }
            }
            if (isLive(rigidbody)) {
                const velocity = [
                    direction[0] * GRENADE_LAUNCH_SPEED,
                    direction[1] * GRENADE_LAUNCH_SPEED,
                    direction[2] * GRENADE_LAUNCH_SPEED,
                ];
                try {
                    rigidbody.method("set_linearVelocity", 1).invoke(velocity);
                }
                catch (_) {
                    try {
                        rigidbody.method("set_velocity", 1).invoke(velocity);
                    }
                    catch (_) {
                        rigidbody.method("AddForce", 2).invoke(velocity, 2);
                    }
                }
            }
            // Raw fallback projectiles do not always have the launcher's normal
            // cleanup path. Bound their lifetime so held rapid fire cannot leak
            // physics objects for the rest of the scene.
            try {
                UnityObject.method("Destroy", 2).invoke(grenade, bulkLaunch ? 5.0 : 8.0);
            }
            catch (_) { }
            return true;
        }
        catch (error) {
            console.error("[" + MENU_NAME + "] Grenade launch failed: " + error);
            return false;
        }
    }
    function queueNuke() {
        if (pendingNukeGrenades > 0) {
            console.log("[" + MENU_NAME + "] Nuke is already launching.");
            return false;
        }
        if (!isUnityObjectAlive(activeLocalPlayer) ||
            !isUnityObjectAlive(getRightHandTransform(activeLocalPlayer)) ||
            !isUnityObjectAlive(findGrenadePrefab())) {
            console.error("[" + MENU_NAME + "] Nuke failed: the right hand or " +
                getCurrentGrenadeVariant().name + " prefab is unavailable.");
            return false;
        }
        pendingNukeGrenades = NUKE_GRENADE_COUNT;
        nukeStalledFrames = 0;
        console.log("[" + MENU_NAME + "] Nuke queued: " + NUKE_GRENADE_COUNT + " grenades.");
        return true;
    }
    function updateNuke(player) {
        if (pendingNukeGrenades <= 0)
            return;
        let launchedThisFrame = 0;
        for (let index = 0; index < NUKE_GRENADES_PER_FRAME && pendingNukeGrenades > 0; index++) {
            if (!launchGrenadeFromHand(player, true, true))
                break;
            pendingNukeGrenades--;
            launchedThisFrame++;
        }
        if (launchedThisFrame > 0)
            nukeStalledFrames = 0;
        else
            nukeStalledFrames++;
        if (pendingNukeGrenades === 0) {
            console.log("[" + MENU_NAME + "] Nuke finished: exactly " + NUKE_GRENADE_COUNT + " grenades launched.");
        }
        else if (nukeStalledFrames >= NUKE_MAX_STALLED_FRAMES) {
            const launched = NUKE_GRENADE_COUNT - pendingNukeGrenades;
            pendingNukeGrenades = 0;
            nukeStalledFrames = 0;
            console.error("[" + MENU_NAME + "] Nuke stopped safely after " + launched +
                " successful launches because grenade spawning remained unavailable.");
        }
    }
    function invokeForObjects(klass, methodNames, includeInactive = false) {
        const stats = { found: 0, invoked: 0, failed: 0 };
        if (!klass)
            return stats;
        const objects = objectsOfClass(klass, includeInactive);
        stats.found = objects.length;
        for (const object of objects) {
            for (const methodName of methodNames) {
                try {
                    object.method(methodName, 0).invoke();
                    stats.invoked++;
                }
                catch (_) {
                    stats.failed++;
                }
            }
        }
        return stats;
    }
    function unlockFieldKey(object, fieldName) {
        try {
            return object.handle.toString() + ":" + fieldName;
        }
        catch (_) {
            return objectName(object) + ":" + fieldName;
        }
    }
    function setRememberedUnlockField(object, fieldName, value) {
        if (!isLive(object))
            return;
        try {
            const field = object.field(fieldName);
            const key = unlockFieldKey(object, fieldName);
            const current = field.value;
            try {
                const underlying = current.field("value__");
                if (!unlockViewFieldState.has(key)) {
                    unlockViewFieldState.set(key, {
                        object,
                        fieldName,
                        value: Number(underlying.value),
                        isEnum: true,
                    });
                }
                underlying.value = Number(value);
                return;
            }
            catch (_) { }
            if (!unlockViewFieldState.has(key)) {
                unlockViewFieldState.set(key, { object, fieldName, value: current, isEnum: false });
            }
            field.value = value;
        }
        catch (_) { }
    }
    function unlockWeaponKey(weapon) {
        if (!isUnityObjectAlive(weapon))
            return "";
        let className = "";
        try {
            className = String(weapon.class.fullName || weapon.class.name || "");
        }
        catch (_) { }
        return className + "|" + objectName(weapon);
    }
    function isPersistentWeaponAsset(weapon) {
        if (!isUnityObjectAlive(weapon))
            return false;
        try {
            const object = componentGameObject(weapon);
            if (!isUnityObjectAlive(object))
                return false;
            const scene = object.method("get_scene", 0).invoke();
            return !scene.method("IsValid", 0).invoke();
        }
        catch (_) {
            return false;
        }
    }
    function managedCollectionValues(collection, limit = 1024) {
        const values = [];
        if (!collection)
            return values;
        let count = 0;
        try {
            if (collection instanceof Il2Cpp.Array)
                count = Number(collection.length);
            else
                count = Number(collection.method("get_Count", 0).invoke());
        }
        catch (_) {
            return values;
        }
        if (!Number.isFinite(count) || count < 0)
            return values;
        count = Math.min(limit, Math.trunc(count));
        for (let index = 0; index < count; index++) {
            try {
                const value = collection instanceof Il2Cpp.Array
                    ? collection.get(index)
                    : collection.method("get_Item", 1).overload("System.Int32").invoke(index);
                if (isLive(value))
                    values.push(value);
            }
            catch (_) { }
        }
        return values;
    }
    function restoreUnlockWeaponCatalog() {
        for (let index = unlockWeaponListAdditions.length - 1; index >= 0; index--) {
            const saved = unlockWeaponListAdditions[index];
            if (!saved || !isLive(saved.collection) || !isUnityObjectAlive(saved.weapon))
                continue;
            try {
                saved.collection.method("Remove", 1).invoke(saved.weapon);
            }
            catch (_) { }
        }
        unlockWeaponListAdditions.length = 0;
        for (const saved of unlockWeaponArrayOverrides.values()) {
            try {
                if (isUnityObjectAlive(saved.object) && saved.originalValues) {
                    const replacement = Il2Cpp.array(WeaponBase, saved.originalValues.length);
                    for (let index = 0; index < saved.originalValues.length; index++)
                        replacement.set(index, saved.originalValues[index]);
                    saved.object.field(saved.fieldName).value = replacement;
                }
                else if (isUnityObjectAlive(saved.object)) {
                    saved.object.field(saved.fieldName).value = saved.original;
                }
            }
            catch (_) { }
            try {
                if (saved.originalPin)
                    saved.originalPin.free();
            }
            catch (_) { }
        }
        unlockWeaponArrayOverrides.clear();
    }
    function expandUnlockWeaponCatalogUnsafe() {
        const stats = { catalogs: 0, candidates: 0, added: 0, total: 0, names: [] };
        if (!mods.unlockAll || !ScriptableWeaponList)
            return stats;
        let candidates = objectArrayValues(findResourceObjects(WeaponBase))
            .filter(weapon => {
            try {
                return isUnityObjectAlive(weapon) && WeaponBase.isAssignableFrom(weapon.class);
            }
            catch (_) {
                return false;
            }
        });
        const persistentCandidates = candidates.filter(isPersistentWeaponAsset);
        if (persistentCandidates.length > 0)
            candidates = persistentCandidates;
        else
            candidates = candidates.filter(weapon => !componentIsActiveInScene(weapon));
        const candidatesByKey = new Map();
        for (const weapon of candidates) {
            const key = unlockWeaponKey(weapon);
            if (key && !candidatesByKey.has(key))
                candidatesByKey.set(key, weapon);
        }
        candidates = Array.from(candidatesByKey.values()).sort((left, right) =>
            unlockWeaponKey(left).localeCompare(unlockWeaponKey(right)));
        stats.candidates = candidates.length;
        for (const catalog of objectsOfClass(ScriptableWeaponList, false, true)) {
            if (!isUnityObjectAlive(catalog) || objectName(catalog) !== "SelectableWeapons")
                continue;
            const weaponCollections = [];
            for (const field of ScriptableWeaponList.fields || []) {
                let fieldName = "";
                let typeName = "";
                try {
                    if (field.isStatic)
                        continue;
                    fieldName = String(field.name);
                    typeName = String(field.type.name);
                }
                catch (_) {
                    continue;
                }
                if (!/weapon/i.test(fieldName) && !/DLAR_WeaponBase/.test(typeName))
                    continue;
                let collection = null;
                try {
                    collection = catalog.field(fieldName).value;
                }
                catch (_) {
                    continue;
                }
                const existing = managedCollectionValues(collection);
                if (existing.length === 0 || !existing.some(weapon => {
                    try {
                        return WeaponBase.isAssignableFrom(weapon.class);
                    }
                    catch (_) {
                        return false;
                    }
                })) {
                    continue;
                }
                weaponCollections.push({ fieldName, collection, existing });
            }
            // SelectableWeapons also carries a small auxiliary weapon array. The
            // primary selectable catalog is the largest WeaponBase collection;
            // expanding every weapon-shaped field would corrupt that auxiliary list.
            weaponCollections.sort((left, right) => right.existing.length - left.existing.length);
            const target = weaponCollections[0];
            if (!target)
                continue;
            stats.catalogs++;
            const { fieldName, collection, existing } = target;
            const knownKeys = new Set(existing.map(unlockWeaponKey).filter(Boolean));
            const missing = candidates.filter(weapon => {
                const key = unlockWeaponKey(weapon);
                if (!key || knownKeys.has(key))
                    return false;
                knownKeys.add(key);
                return true;
            });
            if (missing.length === 0) {
                stats.total = Math.max(stats.total, existing.length);
                continue;
            }
            if (collection instanceof Il2Cpp.Array) {
                const stateKey = unlockFieldKey(catalog, fieldName);
                let saved = unlockWeaponArrayOverrides.get(stateKey);
                if (!saved) {
                    let originalPin = null;
                    try {
                        originalPin = collection.ref(true);
                    }
                    catch (_) {
                        continue;
                    }
                    saved = { object: catalog, fieldName, original: collection, originalPin };
                    unlockWeaponArrayOverrides.set(stateKey, saved);
                }
                try {
                    const combined = existing.concat(missing);
                    const replacement = Il2Cpp.array(WeaponBase, combined.length);
                    for (let index = 0; index < combined.length; index++)
                        replacement.set(index, combined[index]);
                    catalog.field(fieldName).value = replacement;
                    stats.added += missing.length;
                    stats.total = Math.max(stats.total, combined.length);
                    stats.names.push(...missing.map(objectName));
                }
                catch (_) { }
                continue;
            }
            for (const weapon of missing) {
                try {
                    collection.method("Add", 1).invoke(weapon);
                    unlockWeaponListAdditions.push({ collection, weapon });
                    stats.added++;
                    stats.names.push(objectName(weapon));
                }
                catch (_) { }
            }
            stats.total = Math.max(stats.total, managedCollectionValues(collection).length);
        }
        return stats;
    }
    function expandUnlockWeaponCatalog() {
        const stats = { catalogs: 0, candidates: 0, added: 0, total: 0, names: [] };
        if (!mods.unlockAll || !ScriptableWeaponList)
            return stats;
        for (const catalog of objectsOfClass(ScriptableWeaponList, false, true)) {
            if (!isUnityObjectAlive(catalog) || objectName(catalog) !== "SelectableWeapons")
                continue;
            let normalWeapons = null;
            let developerWeapons = null;
            try {
                normalWeapons = catalog.field("weapons").value;
                developerWeapons = catalog.field("devWeapons").value;
            }
            catch (_) {
                continue;
            }
            if (!(normalWeapons instanceof Il2Cpp.Array) ||
                !(developerWeapons instanceof Il2Cpp.Array)) {
                continue;
            }
            const existing = managedCollectionValues(normalWeapons);
            const developer = managedCollectionValues(developerWeapons);
            stats.catalogs++;
            stats.candidates += developer.length;
            const missing = developer.filter(weapon =>
                !existing.some(current => sameObject(current, weapon)));
            if (missing.length === 0) {
                stats.total = Math.max(stats.total, existing.length);
                continue;
            }
            const stateKey = unlockFieldKey(catalog, "weapons");
            if (!unlockWeaponArrayOverrides.has(stateKey)) {
                unlockWeaponArrayOverrides.set(stateKey, {
                    object: catalog,
                    fieldName: "weapons",
                    originalValues: existing.slice(),
                });
            }
            try {
                const combined = existing.concat(missing);
                const replacement = Il2Cpp.array(WeaponBase, combined.length);
                for (let index = 0; index < combined.length; index++)
                    replacement.set(index, combined[index]);
                catalog.field("weapons").value = replacement;
                stats.added += missing.length;
                stats.total = Math.max(stats.total, combined.length);
                stats.names.push(...missing.map(objectName));
            }
            catch (_) { }
        }
        return stats;
    }
    function restoreUnlockViewFields() {
        restoreUnlockWeaponCatalog();
        for (const saved of unlockViewFieldState.values()) {
            if (!isLive(saved.object))
                continue;
            try {
                const field = saved.object.field(saved.fieldName);
                if (saved.fieldName === "_itemTestingOverrideEnabled") {
                    try {
                        saved.object.method("SetItemTestingOverride", 1).invoke(!!saved.value);
                    }
                    catch (_) {
                        field.value = !!saved.value;
                    }
                }
                else if (saved.isEnum)
                    field.value.field("value__").value = saved.value;
                else
                    field.value = saved.value;
            }
            catch (_) { }
        }
        unlockViewFieldState.clear();
    }
    function setLoadoutShowAll(panel) {
        if (!mods.unlockAll || !UIPanelLoadout || !isLive(panel))
            return;
        const showModeFields = [];
        try {
            for (const field of UIPanelLoadout.fields) {
                const typeName = String(field.type.name);
                if (typeName.endsWith("WeaponsShowMode"))
                    showModeFields.push(String(field.name));
            }
        }
        catch (_) { }
        for (const fieldName of showModeFields) {
            // WeaponsShowMode.ShowAll is the zero enum value.
            setRememberedUnlockField(panel, fieldName, 0);
        }
    }
    function setSkinPanelShowLocked(panel) {
        if (!mods.unlockAll || !isLive(panel))
            return;
        // Nonzero is this build's "show locked" presentation mode. The
        // individual ownership hooks then make those rows selectable.
        setRememberedUnlockField(panel, "lockedAppearanceVisibility", 1);
    }
    function setUnlockCatalogTesting() {
        if (!mods.unlockAll || !PlayFabManagerClient)
            return;
        try {
            const manager = PlayFabManagerClient.field("Instance").value;
            if (!isLive(manager))
                return;
            const key = unlockFieldKey(manager, "_itemTestingOverrideEnabled");
            const firstOverride = !unlockViewFieldState.has(key);
            setRememberedUnlockField(manager, "_itemTestingOverrideEnabled", true);
            if (firstOverride) {
                try {
                    manager.method("SetItemTestingOverride", 1).invoke(true);
                }
                catch (_) { }
            }
        }
        catch (_) { }
    }
    function unlockTransitionRuntimeReady(player) {
        if (!componentIsActiveInScene(player))
            return false;
        const playerKey = String(visualObjectKey(player));
        if (unlockTransitionSourcePlayerKey && playerKey === unlockTransitionSourcePlayerKey &&
            Date.now() < unlockTransitionSamePlayerNotBefore) {
            return false;
        }
        const manager = currentMannequinLockerManager();
        if (!isLive(manager))
            return false;
        try {
            const networkedCosmetics = manager.field("_networkedPlayerCosmeticsManager").value;
            if (!isUnityObjectAlive(networkedCosmetics))
                return false;
            const runner = networkedCosmetics.method("get_Runner", 0).invoke();
            if (!isUnityObjectAlive(runner))
                return false;
            if (methodBoolean(networkedCosmetics, ["get_HasStateAuthority"]) === false)
                return false;
            if (methodBoolean(runner, ["get_IsRunning"]) !== true)
                return false;
            if (methodBoolean(runner, ["get_IsShutdown"]) === true)
                return false;
            if (methodBoolean(runner, ["get_IsInSession"]) === false)
                return false;
            return true;
        }
        catch (_) {
            return false;
        }
    }
    function restoreTransitionCosmetics() {
        const manager = currentMannequinLockerManager();
        if (!isLive(manager))
            return { attempted: unlockTransitionCosmetics.length, equipped: 0, overridden: 0 };
        let equipped = 0;
        let overridden = 0;
        try {
            manager.method("ClearTemporaryCosmeticOverrides", 1)
                .overload("System.String")
                .invoke(Il2Cpp.string(UNLOCK_TRANSITION_OVERRIDE_SOURCE));
        }
        catch (_) { }
        for (const cosmetic of unlockTransitionCosmetics) {
            try {
                const accepted = !!manager.method("SetEquippedItemInternal", 4)
                    .overload("System.String", "System.String", "System.Boolean", "System.Boolean")
                    .invoke(
                        Il2Cpp.string(cosmetic.contentType),
                        Il2Cpp.string(cosmetic.itemId),
                        false,
                        true);
                if (accepted) {
                    equipped++;
                    unlockTransitionConfirmedContentTypes.add(cosmetic.contentType);
                }
            }
            catch (_) { }
            try {
                const accepted = !!manager.method("SetTemporaryCosmeticOverride", 3)
                    .overload("System.String", "System.String", "System.String")
                    .invoke(
                        Il2Cpp.string(UNLOCK_TRANSITION_OVERRIDE_SOURCE),
                        Il2Cpp.string(cosmetic.contentType),
                        Il2Cpp.string(cosmetic.itemId));
                if (accepted)
                    overridden++;
            }
            catch (_) { }
        }
        try {
            manager.method("ApplyTemporaryCosmeticOverrides", 0).invoke();
        }
        catch (_) { }
        try {
            const networkedCosmetics = manager.field("_networkedPlayerCosmeticsManager").value;
            if (isUnityObjectAlive(networkedCosmetics)) {
                // SetEquippedItemInternal normally publishes this itself, but a
                // same-ID replay may be treated as unchanged. Force the normal
                // equipment RPC once so a freshly spawned NetworkBehaviour
                // receives the complete hashed loadout.
                try {
                    networkedCosmetics.method("RPC_OnEquipmentChanged", 1)
                        .overload("System.Boolean").invoke(false);
                }
                catch (_) { }
                networkedCosmetics.method("RefreshEquipmentVisuals", 0).invoke();
            }
        }
        catch (_) { }
        return { attempted: unlockTransitionCosmetics.length, equipped, overridden };
    }
    function updateUnlockTransitionRestore(player) {
        if (!unlockTransitionRestorePending || Date.now() < unlockTransitionRestoreNotBefore ||
            frameNumber < unlockTransitionRetryFrame) {
            return;
        }
        if (!unlockTransitionRuntimeReady(player)) {
            unlockTransitionStableFrames = 0;
            return;
        }
        unlockTransitionStableFrames++;
        if (unlockTransitionStableFrames < UNLOCK_TRANSITION_STABLE_FRAMES)
            return;
        if (!mods.unlockAll) {
            mods.unlockAll = true;
        }
        if (unlockTransitionRestoreAttempts === 0) {
            pendingUnlockRefresh = true;
            unlockRefreshFrames = [frameNumber + 60];
            setUnlockCatalogTesting();
            expandUnlockWeaponCatalog();
            refreshClipboardLobbyAccess();
        }
        const weaponLoadoutRestored = restoreTransitionWeapons();
        const result = restoreTransitionCosmetics();
        unlockTransitionRestoreAttempts++;
        const allEquipped = unlockTransitionConfirmedContentTypes.size >= result.attempted;
        // Run at least two passes: the first republishes the network dictionary,
        // and the second lands after the new room's cosmetic assets finish loading.
        if (result.attempted === 0 || (allEquipped && unlockTransitionRestoreAttempts >= 2) ||
            unlockTransitionRestoreAttempts >= UNLOCK_TRANSITION_MAX_RETRIES) {
            unlockTransitionRestorePending = false;
            unlockTransitionSourcePlayerKey = "";
            console.log("[" + MENU_NAME + "] Unlock All refreshed in the new room; cosmetic loadout " +
                "equipped=" + unlockTransitionConfirmedContentTypes.size + "/" + result.attempted +
                " temporary-overrides=" + result.overridden +
                " weapon-loadout=" + (weaponLoadoutRestored ? "restored" : "unchanged") + ".");
            clearTransitionWeaponSnapshot();
            return;
        }
        unlockTransitionRetryFrame = frameNumber + UNLOCK_TRANSITION_RETRY_FRAMES;
    }
    function setUnlockViewFilters() {
        if (!mods.unlockAll) {
            restoreUnlockViewFields();
            return { catalogs: 0, candidates: 0, added: 0, total: 0, names: [] };
        }
        const hiddenWeapons = expandUnlockWeaponCatalog();
        setUnlockCatalogTesting();
        for (const panel of objectsOfClass(UIPanelWeaponSkins, true)) {
            setSkinPanelShowLocked(panel);
        }
        for (const panel of objectsOfClass(UIPanelLoadout, true)) {
            setLoadoutShowAll(panel);
        }
        return hiddenWeapons;
    }
    function unlockStats(label, stats) {
        return label + " found=" + stats.found +
            " calls=" + stats.invoked + " failed=" + stats.failed;
    }
    function refreshUnlockViews(verbose = false) {
        const hiddenWeapons = setUnlockViewFilters();
        const loadouts = invokeForObjects(UIPanelLoadout, ["LoadWeapons"], true);
        // Reset the visual lock state only. UITouchWeaponSelection.Unlock() is an
        // interaction callback, not a harmless refresh, and forcing it on every
        // row can leave the loadout screen unable to build an equip operation.
        const weaponRows = invokeForObjects(UITouchWeaponSelection, ["ResetLockStatus"], true);
        const skins = invokeForObjects(UIPanelWeaponSkins, [
            "RefreshHiddenAppearanceRows",
            "RefreshUnlocks",
            "RefreshCharmUnlocks",
        ], true);
        const cosmetics = invokeForObjects(PlayerCosmeticsLockerPanel, ["RefreshActiveSlots"], true);
        const cosmeticRows = invokeForObjects(UITouchCosmeticSelection, [], true);
        const tech = invokeForObjects(UITechNode, ["SetInitialLockState"], true);
        const techWraps = invokeForObjects(TechNodeWeaponWrap, ["RefreshSecondaryLock"], true);
        if (verbose) {
            console.log("[" + MENU_NAME + "] Unlock refresh: " + [
                unlockStats("loadouts", loadouts),
                unlockStats("weapon rows", weaponRows),
                unlockStats("skins", skins),
                unlockStats("cosmetics", cosmetics),
                unlockStats("cosmetic rows", cosmeticRows),
                unlockStats("tech", tech),
                unlockStats("tech wraps", techWraps),
                "hidden weapons catalogs=" + hiddenWeapons.catalogs +
                    " candidates=" + hiddenWeapons.candidates +
                    " added=" + hiddenWeapons.added +
                    " total=" + hiddenWeapons.total,
            ].join("; "));
            if (hiddenWeapons.names.length > 0) {
                console.log("[" + MENU_NAME + "] Added hidden weapon prefabs: " +
                    hiddenWeapons.names.join(", ") + ".");
            }
        }
    }
    function sweepAmmo() {
        for (const weapon of getLocalHeldWeapons())
            topUpWeapon(weapon);
        try {
            const storages = findObjects(AmmoStorage);
            for (let index = 0; storages && index < storages.length; index++) {
                try {
                    const storage = storages.get(index);
                    if (isLocalAmmoStorage(storage))
                        storage.method("SetMaxAmmo", 0).invoke();
                }
                catch (_) { }
            }
        }
        catch (_) { }
    }
    function resetFireRateTimers() {
        try {
            const manager = CooldownManager.method("get_Instance", 0).invoke();
            if (!isLive(manager))
                return false;
            manager.method("ResetAllTimers", 0).invoke();
            return true;
        }
        catch (_) {
            return false;
        }
    }
    function setPlayerVelocity(rigidbody, velocity) {
        if (!isUnityObjectAlive(rigidbody))
            return false;
        try {
            rigidbody.method("set_linearVelocity", 1).invoke(velocity);
            return true;
        }
        catch (_) { }
        try {
            rigidbody.method("set_velocity", 1).invoke(velocity);
            return true;
        }
        catch (_) {
            return false;
        }
    }
    function restoreJoystickFly() {
        if (!joystickFlyState)
            return;
        const rigidbody = joystickFlyState.rigidbody;
        if (isUnityObjectAlive(rigidbody)) {
            try {
                rigidbody.method("set_useGravity", 1).invoke(!!joystickFlyState.useGravity);
            }
            catch (_) { }
            setPlayerVelocity(rigidbody, [0, 0, 0]);
        }
        joystickFlyState = null;
    }
    function applyJoystickFly(player) {
        if (!mods.joystickFly) {
            if (joystickFlyState)
                restoreJoystickFly();
            return;
        }
        try {
            const rigidbody = player.field("Rigidbody").value;
            if (!isUnityObjectAlive(rigidbody)) {
                restoreJoystickFly();
                return;
            }
            if (!joystickFlyState || !sameObject(joystickFlyState.rigidbody, rigidbody)) {
                restoreJoystickFly();
                let useGravity = true;
                try {
                    useGravity = !!rigidbody.method("get_useGravity", 0).invoke();
                }
                catch (_) { }
                joystickFlyState = { rigidbody, useGravity };
            }
            try {
                rigidbody.method("set_useGravity", 1).invoke(false);
            }
            catch (_) { }
            if (isLive(menuRoot)) {
                setPlayerVelocity(rigidbody, [0, 0, 0]);
                return;
            }
            const camera = getCameraTransform(player);
            const forwardRaw = isUnityObjectAlive(camera)
                ? vector3Value(camera.method("get_forward", 0).invoke())
                : null;
            const rightRaw = isUnityObjectAlive(camera)
                ? vector3Value(camera.method("get_right", 0).invoke())
                : null;
            if (!forwardRaw || !rightRaw) {
                setPlayerVelocity(rigidbody, [0, 0, 0]);
                return;
            }
            const horizontalForwardLength = Math.sqrt(forwardRaw[0] * forwardRaw[0] + forwardRaw[2] * forwardRaw[2]) || 1.0;
            const horizontalRightLength = Math.sqrt(rightRaw[0] * rightRaw[0] + rightRaw[2] * rightRaw[2]) || 1.0;
            let velocity = [
                (forwardRaw[0] / horizontalForwardLength) * leftStickY +
                    (rightRaw[0] / horizontalRightLength) * leftStickX,
                rightStickY,
                (forwardRaw[2] / horizontalForwardLength) * leftStickY +
                    (rightRaw[2] / horizontalRightLength) * leftStickX,
            ];
            const magnitude = Math.sqrt(velocity[0] * velocity[0] + velocity[1] * velocity[1] + velocity[2] * velocity[2]);
            if (magnitude > 1.0) {
                velocity = [velocity[0] / magnitude, velocity[1] / magnitude, velocity[2] / magnitude];
            }
            let deltaTime = 1.0 / 72.0;
            try {
                deltaTime = Math.max(0.001, Math.min(0.05, Number(Time.method("get_deltaTime", 0).invoke())));
            }
            catch (_) { }
            // The current locomotion controller overwrites Rigidbody velocity in
            // its next physics step. Move the authoritative body directly each
            // LateUpdate and keep its normal velocity neutral so flight remains
            // responsive instead of being cancelled by GorillaMovement.
            setPlayerVelocity(rigidbody, [0, 0, 0]);
            if (magnitude > 0.0) {
                const currentPosition = vector3Value(rigidbody.method("get_position", 0).invoke());
                if (currentPosition) {
                    const nextPosition = [
                        currentPosition[0] + velocity[0] * JOYSTICK_FLY_SPEED * deltaTime,
                        currentPosition[1] + velocity[1] * JOYSTICK_FLY_SPEED * deltaTime,
                        currentPosition[2] + velocity[2] * JOYSTICK_FLY_SPEED * deltaTime,
                    ];
                    try {
                        rigidbody.method("set_position", 1).invoke(nextPosition);
                    }
                    catch (_) {
                        getTransform(player).method("set_position", 1).invoke(nextPosition);
                    }
                }
            }
            if (rightStickX !== 0.0) {
                const transform = getTransform(player);
                const currentRotation = transform.method("get_rotation", 0).invoke();
                const yaw = Quaternion.method("Euler", 3).invoke(0, rightStickX * JOYSTICK_FLY_TURN_SPEED * deltaTime, 0);
                transform.method("set_rotation", 1).invoke(Quaternion.method("op_Multiply", 2).invoke(yaw, currentRotation));
            }
        }
        catch (_) {
            restoreJoystickFly();
        }
    }
    function applyTriggerFly(player) {
        if (!mods.triggerFly || mods.joystickFly || isLive(menuRoot) || !(leftTrigger || leftTriggerAmount > 0.5))
            return;
        try {
            const rigidbody = player.field("Rigidbody").value;
            if (!isLive(rigidbody))
                return;
            const hand = getLeftHandTransform(player);
            const directionSource = isLive(hand) ? hand : getCameraTransform(player);
            if (!isLive(directionSource))
                return;
            const forward = directionSource.method("get_forward", 0).invoke();
            const velocity = [
                Number(forward.field("x").value) * TRIGGER_FLY_SPEED,
                Number(forward.field("y").value) * TRIGGER_FLY_SPEED,
                Number(forward.field("z").value) * TRIGGER_FLY_SPEED,
            ];
            try {
                rigidbody.method("set_linearVelocity", 1).invoke(velocity);
            }
            catch (_) {
                try {
                    rigidbody.method("set_velocity", 1).invoke(velocity);
                }
                catch (_) {
                    const current = rigidbody.method("get_linearVelocity", 0).invoke();
                    rigidbody.method("AddForce", 2).invoke([
                        velocity[0] - Number(current.field("x").value),
                        velocity[1] - Number(current.field("y").value),
                        velocity[2] - Number(current.field("z").value),
                    ], 2);
                }
            }
        }
        catch (_) { }
    }
    function createHandPlatform(name, color) {
        let object = null;
        let material = null;
        try {
            object = GameObject.method("CreatePrimitive", 1).invoke(3);
            setName(object, name);
            const transform = getTransform(object);
            transform.method("set_localScale", 1).invoke(PLATFORM_SCALE);
            transform.method("set_rotation", 1).invoke(identityQuaternion);
            const renderer = getComponent(object, Renderer);
            if (isLive(renderer)) {
                renderer.method("set_enabled", 1).invoke(true);
                material = renderer.method("get_material", 0).invoke();
                if (isLive(material)) {
                    const shader = getMenuSurfaceShader();
                    if (isLive(shader))
                        material.method("set_shader", 1).invoke(shader);
                    material.method("set_color", 1).invoke(color);
                    try {
                        material.method("SetColor", 2)
                            .overload("System.String", "UnityEngine.Color")
                            .invoke(Il2Cpp.string("_BaseColor"), color);
                    }
                    catch (_) { }
                }
            }
            const collider = getComponent(object, Collider);
            if (isLive(collider)) {
                try {
                    collider.method("set_enabled", 1).invoke(true);
                }
                catch (_) { }
                try {
                    collider.method("set_isTrigger", 1).invoke(false);
                }
                catch (_) { }
            }
            const body = addComponent(object, Rigidbody);
            if (isLive(body)) {
                try {
                    body.method("set_useGravity", 1).invoke(false);
                }
                catch (_) { }
                try {
                    body.method("set_isKinematic", 1).invoke(true);
                }
                catch (_) { }
                try {
                    body.method("set_detectCollisions", 1).invoke(true);
                }
                catch (_) { }
            }
            object.method("SetActive", 1).invoke(false);
            return { object, material, active: false };
        }
        catch (_) {
            if (isUnityObjectAlive(object))
                destroy(object);
            if (isUnityObjectAlive(material))
                destroy(material);
            return null;
        }
    }
    function setHandPlatformVisible(state, visible) {
        if (!state || !isUnityObjectAlive(state.object) || state.active === visible)
            return;
        try {
            state.object.method("SetActive", 1).invoke(visible);
            state.active = visible;
        }
        catch (_) { }
    }
    function destroyHandPlatform(state) {
        if (!state)
            return;
        if (isUnityObjectAlive(state.object))
            destroy(state.object);
        if (isUnityObjectAlive(state.material))
            destroy(state.material);
    }
    function clearPlatforms() {
        destroyHandPlatform(leftHandPlatform);
        destroyHandPlatform(rightHandPlatform);
        leftHandPlatform = null;
        rightHandPlatform = null;
    }
    function updateHandPlatform(player, left, held) {
        let state = left ? leftHandPlatform : rightHandPlatform;
        if (!held) {
            setHandPlatformVisible(state, false);
            return;
        }
        // Leave an active platform fixed where the grip was first pressed so
        // it is stable enough to stand on. Releasing the grip returns it to
        // the pool; the next press moves and re-enables the same object.
        if (state && isUnityObjectAlive(state.object) && state.active)
            return;
        const hand = left ? getLeftHandTransform(player) : getRightHandTransform(player);
        const position = transformPosition(hand);
        if (!position) {
            setHandPlatformVisible(state, false);
            return;
        }
        if (!state || !isUnityObjectAlive(state.object)) {
            destroyHandPlatform(state);
            state = createHandPlatform(left ? "AnimalRivalsLeftPlatform" : "AnimalRivalsRightPlatform", PLATFORM_COLOR);
            if (left)
                leftHandPlatform = state;
            else
                rightHandPlatform = state;
        }
        if (!state || !isUnityObjectAlive(state.object))
            return;
        try {
            const transform = getTransform(state.object);
            transform.method("set_position", 1).invoke([
                position[0],
                position[1] - PLATFORM_HAND_OFFSET_Y,
                position[2],
            ]);
            transform.method("set_rotation", 1).invoke(identityQuaternion);
            setHandPlatformVisible(state, true);
        }
        catch (_) {
            setHandPlatformVisible(state, false);
        }
    }
    function updatePlatforms(player) {
        if (!mods.platforms)
            return;
        updateHandPlatform(player, true, leftGrip);
        updateHandPlatform(player, false, rightGrip);
    }
    function vector3Value(value) {
        try {
            const result = [
                Number(value.field("x").value),
                Number(value.field("y").value),
                Number(value.field("z").value),
            ];
            return result.every(Number.isFinite) ? result : null;
        }
        catch (_) {
            return null;
        }
    }
    function transformPosition(transform) {
        if (!isUnityObjectAlive(transform))
            return null;
        try {
            return vector3Value(transform.method("get_position", 0).invoke());
        }
        catch (_) {
            return null;
        }
    }
    function squaredDistance(left, right) {
        const x = left[0] - right[0];
        const y = left[1] - right[1];
        const z = left[2] - right[2];
        return x * x + y * y + z * z;
    }
    function discoverMovementFieldNames() {
        if (discoveredMovementBoostFieldNames)
            return discoveredMovementBoostFieldNames;
        discoveredMovementBoostFieldNames = [];
        try {
            for (const field of GorillaMovement.fields) {
                const name = String(field.name);
                if (/(jump|speed|velocity|arm|length|threshold|movement)/i.test(name)) {
                    discoveredMovementBoostFieldNames.push(name);
                }
            }
        }
        catch (_) { }
        return discoveredMovementBoostFieldNames;
    }
    function discoverMovementComponentFieldNames(player) {
        if (!player || !isLive(player) || !isUnityObjectAlive(player))
            return [];
        if (discoveredMovementComponentFieldNames)
            return discoveredMovementComponentFieldNames;
        discoveredMovementComponentFieldNames = [];
        try {
            for (const field of player.class.fields) {
                const name = String(field.name);
                if (/(movement|gorilla|locomotion|controller)/i.test(name)) {
                    discoveredMovementComponentFieldNames.push(name);
                }
            }
        }
        catch (_) { }
        return discoveredMovementComponentFieldNames;
    }
    function boundGorillaMovementField(movement, name) {
        if (!GorillaMovement || !isLive(movement))
            return null;
        try {
            return GorillaMovement.field(name).bind(movement);
        }
        catch (_) {
            return null;
        }
    }
    function resolveMovementField(movement, names, required = false) {
        for (const name of names) {
            try {
                const field = GorillaMovement.field(name);
                if (field)
                    return name;
            }
            catch (_) { }
        }
        const discovered = discoverMovementFieldNames();
        const loweredNames = discovered.map(name => String(name).toLowerCase());
        for (const candidate of names) {
            const lowered = String(candidate).toLowerCase();
            for (let index = 0; index < loweredNames.length; index++) {
                if (new RegExp(lowered, "i").test(loweredNames[index])) {
                    const field = discovered[index];
                    if (boundGorillaMovementField(movement, field))
                        return field;
                }
            }
        }
        if (!required)
            return null;
        for (const discoveredName of discovered) {
            const discoveredField = boundGorillaMovementField(movement, discoveredName);
            if (!discoveredField)
                continue;
            try {
                const value = Number(discoveredField.value);
                if (Number.isFinite(value))
                    return discoveredName;
            }
            catch (_) { }
        }
        return null;
    }
    function setMovementField(movement, names, delta, overwriteValue = null) {
        if (!isUnityObjectAlive(movement))
            return false;
        const resolved = resolveMovementField(movement, names, false);
        if (!resolved)
            return false;
        const field = boundGorillaMovementField(movement, resolved);
        if (!field)
            return false;
        const current = Number(field.value);
        if (!Number.isFinite(current))
            return false;
        try {
            field.value = overwriteValue !== null ? overwriteValue : current + delta;
            return true;
        }
        catch (_) {
            return false;
        }
    }
    function collectMovementCandidateFieldsWithRange(movement, expressions, minAbs = 0, maxAbs = Number.POSITIVE_INFINITY) {
        const result = [];
        try {
            const discovered = discoverMovementFieldNames();
            for (const name of discovered) {
                const lowered = String(name).toLowerCase();
                if (!expressions.some(expression => expression.test(lowered)))
                    continue;
                const field = boundGorillaMovementField(movement, name);
                if (!field)
                    continue;
                try {
                    const value = Number(field.value);
                    const magnitude = Math.abs(value);
                    if (!Number.isFinite(value) || magnitude > maxAbs || magnitude < minAbs)
                        continue;
                    if (result.includes(name))
                        continue;
                    result.push(name);
                }
                catch (_) { }
            }
        }
        catch (_) { }
        return result;
    }
    function collectArmLengthFields(movement) {
        const names = collectMovementCandidateFieldsWithRange(movement, [/arm|reach|grab|stretch|length|distance|throw|launch/], 0.001, 40.0);
        return names.length > 0 ? names : [];
    }
    function collectUnstickFields(movement) {
        const names = collectMovementCandidateFieldsWithRange(movement, [/un.?stick|release|grip|reach|distance|unhold|return/i], 0.001, 20.0);
        return names.filter(name => /un.?stick|release/i.test(name.toLowerCase()));
    }
    function recordSpeedBoostFieldBaseline(movement, names, baselineValues) {
        const resolved = resolveMovementField(movement, names, false);
        if (!resolved)
            return null;
        if (baselineValues && baselineValues[resolved] !== undefined)
            return resolved;
        const field = boundGorillaMovementField(movement, resolved);
        if (!field)
            return null;
        try {
            const value = Number(field.value);
            if (!Number.isFinite(value))
                return null;
            baselineValues[resolved] = value;
            return resolved;
        }
        catch (_) {
            return null;
        }
    }
    function resolveGorillaMovementComponent(player) {
        try {
            const direct = player.field("ActiveGorillaPlayer").value;
            if (isUnityObjectAlive(direct))
                return direct;
        }
        catch (_) { }
        const fieldNames = [
            "activeGorillaPlayer",
            "gorillaMovement",
            "movement",
            "movementController",
            "activeMovement",
            "gorillaPlayerMovement",
        ];
        for (const fieldName of fieldNames) {
            try {
                const value = player.field(fieldName).value;
                if (isUnityObjectAlive(value) && GorillaMovement && GorillaMovement.isAssignableFrom(value.class))
                    return value;
            }
            catch (_) { }
        }
        for (const fieldName of discoverMovementComponentFieldNames(player)) {
            try {
                const value = player.field(fieldName).value;
                if (isUnityObjectAlive(value) && GorillaMovement && GorillaMovement.isAssignableFrom(value.class)) {
                    return value;
                }
            }
            catch (_) { }
        }
        return null;
    }
    function resolveLongArmsMovementComponent(player) {
        const resolved = resolveGorillaMovementComponent(player);
        if (isUnityObjectAlive(resolved))
            return resolved;
        const playerObject = componentGameObject(player);
        if (isUnityObjectAlive(playerObject) && GorillaMovement) {
            const direct = getComponent(playerObject, GorillaMovement);
            if (isUnityObjectAlive(direct))
                return direct;
            try {
                const nested = playerObject.method("GetComponentInChildren", 2)
                    .overload("System.Type", "System.Boolean")
                    .invoke(GorillaMovement.type.object, true);
                if (isUnityObjectAlive(nested))
                    return nested;
            }
            catch (_) { }
        }
        // Never borrow a scene-global movement component: it may belong to a
        // remote player. Long Arms can still use the local player transform
        // when this player's GorillaMovement component is unavailable.
        return null;
    }
    function rememberSpeedBoostField(name, base) {
        for (const entry of speedBoostTouchedMovementValues) {
            if (entry.name === name)
                return;
        }
        speedBoostTouchedMovementValues.push({ name, base });
    }
    function applySpeedBoostField(movement, names, delta, absoluteValue = null) {
        const resolved = resolveMovementField(movement, names, false);
        if (!resolved)
            return false;
        const field = boundGorillaMovementField(movement, resolved);
        if (!field)
            return false;
        try {
            const base = Number(field.value);
            if (!Number.isFinite(base))
                return false;
            const nextValue = absoluteValue !== null && absoluteValue !== undefined ? absoluteValue : base + delta;
            if (!Number.isFinite(nextValue))
                return false;
            field.value = nextValue;
            rememberSpeedBoostField(resolved, base);
            return true;
        }
        catch (_) {
            return false;
        }
    }
    function snapshotMovementPower(movement) {
        const names = [
            ["jumpMultiplierLeft", "leftJumpMultiplier", "jumpMultLeft"],
            ["jumpMultiplierRight", "rightJumpMultiplier", "jumpMultRight"],
            ["maxJumpSpeedLeft", "leftMaxJumpSpeed", "maxJumpSpeedLeftHand", "leftJumpSpeed"],
            ["maxJumpSpeedRight", "rightMaxJumpSpeed", "maxJumpSpeedRightHand", "rightJumpSpeed"],
            ["velocityChangeThresholdLeft", "leftVelocityChangeThreshold"],
            ["velocityChangeThresholdRight", "rightVelocityChangeThreshold"],
        ];
        const result = {};
        let captured = 0;
        for (const aliases of names) {
            const resolved = resolveMovementField(movement, aliases, false);
            if (!resolved)
                continue;
            const field = boundGorillaMovementField(movement, resolved);
            if (!field)
                continue;
            const value = Number(field.value);
            if (!Number.isFinite(value))
                continue;
            if (result[resolved] === undefined) {
                result[resolved] = value;
                captured++;
            }
        }
        return captured === 0 ? null : result;
    }
    function applySpeedBoost(player) {
        if (!mods.speedBoost)
            return;
        try {
            const movement = resolveGorillaMovementComponent(player);
            if (!isUnityObjectAlive(movement))
                return;
            if (!sameObject(speedBoostPlayer, movement)) {
                restoreSpeedBoost();
                const originalMovementValues = snapshotMovementPower(movement);
                if (!originalMovementValues)
                    return;
                speedBoostPlayer = movement;
                speedBoostController = player;
                speedBoostOriginalMovementValues = originalMovementValues;
                speedBoostTouchedMovementValues = [];
                try {
                    const rigidbody = player.field("Rigidbody").value;
                    const cap = Number(rigidbody.method("get_maxLinearVelocity", 0).invoke());
                    speedBoostOriginalVelocityCap = Number.isFinite(cap) && cap > 0 ? cap : null;
                }
                catch (_) {
                    speedBoostOriginalVelocityCap = null;
                }
                if (speedBoostOriginalVelocityCap === null) {
                    try {
                        const fallbackCap = Number(PlayerController.field("DefaultMaxLinearVelocity").value);
                        if (Number.isFinite(fallbackCap) && fallbackCap > 0)
                            speedBoostOriginalVelocityCap = fallbackCap;
                    }
                    catch (_) { }
                }
            }
            const targets = {
                jumpMultiplierLeft: SPEED_BOOST_JUMP_MULTIPLIER_DELTA,
                jumpMultiplierRight: SPEED_BOOST_JUMP_MULTIPLIER_DELTA,
                maxJumpSpeedLeft: SPEED_BOOST_MAX_SPEED_DELTA,
                maxJumpSpeedRight: SPEED_BOOST_MAX_SPEED_DELTA,
                velocityChangeThresholdLeft: 0.0,
                velocityChangeThresholdRight: 0.0,
            };
            for (const [name, delta] of Object.entries(targets)) {
                const baseline = Number(speedBoostOriginalMovementValues[name]);
                const field = boundGorillaMovementField(movement, name);
                if (field && Number.isFinite(baseline))
                    field.value = baseline + delta;
            }
            try {
                movement.method("InvokeIfMovePowerChanged", 0).invoke();
            }
            catch (_) { }
            try {
                player.method("SetVelocityCap", 1).invoke(SPEED_BOOST_VELOCITY_CAP);
            }
            catch (_) { }
        }
        catch (_) { }
    }
    function restoreSpeedBoost() {
        if (!speedBoostPlayer && !speedBoostController)
            return;
        if (isUnityObjectAlive(speedBoostPlayer) && speedBoostOriginalMovementValues) {
            for (const [name, value] of Object.entries(speedBoostOriginalMovementValues)) {
                const field = boundGorillaMovementField(speedBoostPlayer, name);
                if (!field)
                    continue;
                try {
                    field.value = value;
                }
                catch (_) { }
            }
            try {
                speedBoostPlayer.method("InvokeIfMovePowerChanged", 0).invoke();
            }
            catch (_) { }
        }
        if (isUnityObjectAlive(speedBoostController) && speedBoostOriginalVelocityCap !== null) {
            try {
                speedBoostController.method("SetVelocityCap", 1).invoke(speedBoostOriginalVelocityCap);
            }
            catch (_) { }
        }
        speedBoostPlayer = null;
        speedBoostController = null;
        speedBoostOriginalVelocityCap = null;
        speedBoostOriginalMovementValues = null;
        speedBoostTouchedMovementValues = [];
        speedBoostLeftApplied = false;
        speedBoostRightApplied = false;
        try {
            const manager = MovementManager ? MovementManager.field("Instance").value : null;
            if (isUnityObjectAlive(manager))
                manager.method("ApplyActiveMovementModifiers", 0).invoke();
        }
        catch (_) { }
    }
    function applyLongArms(player) {
        if (!mods.longArms)
            return;
        try {
            if (!isUnityObjectAlive(player))
                return;
            const movement = GorillaMovement ? resolveLongArmsMovementComponent(player) : null;
            const owner = isUnityObjectAlive(movement) ? movement : player;
            if (!longArmState || !sameObject(longArmState.owner, owner)) {
                restoreLongArms();
                const field = isUnityObjectAlive(movement)
                    ? boundGorillaMovementField(movement, "maxArmLength")
                    : null;
                const baseline = field ? Number(field.value) : Number.NaN;
                let movementTransform = null;
                let movementScale = null;
                try {
                    movementTransform = getTransform(movement);
                    movementScale = vector3Value(movementTransform.method("get_localScale", 0).invoke());
                }
                catch (_) { }
                if (!isUnityObjectAlive(movementTransform)) {
                    try {
                        movementTransform = getTransform(player);
                        movementScale = vector3Value(movementTransform.method("get_localScale", 0).invoke());
                    }
                    catch (_) { }
                }
                const hasLengthField = Number.isFinite(baseline) && baseline > 0;
                if (!hasLengthField && (!isUnityObjectAlive(movementTransform) || !movementScale))
                    return;
                longArmState = {
                    owner,
                    movement,
                    maxArmLength: hasLengthField ? baseline : null,
                    movementTransform,
                    movementScale,
                };
            }
            const field = isUnityObjectAlive(movement)
                ? boundGorillaMovementField(movement, "maxArmLength")
                : null;
            if (field && Number.isFinite(longArmState.maxArmLength)) {
                const target = Math.min(5.0, Math.max(3.5,
                    longArmState.maxArmLength * LONG_ARMS_MULTIPLIER));
                if (Math.abs(Number(field.value) - target) > 0.001)
                    field.value = target;
            }
            // Animal Company's proven Long Arms path scales the locomotion
            // root as well as extending the reach limit. Preserve the exact
            // original scale so disabling the mod is lossless.
            if (isUnityObjectAlive(longArmState.movementTransform) && longArmState.movementScale) {
                const baselineScale = longArmState.movementScale;
                longArmState.movementTransform.method("set_localScale", 1).invoke([
                    baselineScale[0] * LONG_ARMS_BODY_SCALE,
                    baselineScale[1] * LONG_ARMS_BODY_SCALE,
                    baselineScale[2] * LONG_ARMS_BODY_SCALE,
                ]);
            }
        }
        catch (_) { }
    }
    function restoreLongArms() {
        if (longArmState) {
            if (isUnityObjectAlive(longArmState.movement) && Number.isFinite(longArmState.maxArmLength)) {
                try {
                    const field = boundGorillaMovementField(longArmState.movement, "maxArmLength");
                    if (field)
                        field.value = longArmState.maxArmLength;
                }
                catch (_) { }
            }
            if (isUnityObjectAlive(longArmState.movementTransform) && longArmState.movementScale) {
                try {
                    longArmState.movementTransform.method("set_localScale", 1).invoke(longArmState.movementScale);
                }
                catch (_) { }
            }
        }
        longArmState = null;
    }
    function visualObjectKey(value) {
        try {
            return String(value.handle);
        }
        catch (_) {
            return "";
        }
    }
    function getVisualShader() {
        if (isUnityObjectAlive(visualShader))
            return visualShader;
        visualShader = null;
        for (const name of [
            "Universal Render Pipeline/Unlit",
            "Universal Render Pipeline/Unlit/Simple",
            "Unlit/Color",
            "Unlit/Texture",
            "Unlit/Transparent",
            "Particles/Standard Unlit",
            "Sprites/Default",
            "Legacy Shaders/Particles/Alpha Blended",
            "Hidden/Internal-Colored",
            "UI/Default",
        ]) {
            try {
                const shader = Shader.method("Find", 1).invoke(Il2Cpp.string(name));
                if (isUnityObjectAlive(shader) &&
                    (() => { try {
                        return !!shader.method("get_isSupported", 0).invoke();
                    }
                    catch (_) {
                        return true;
                    } })()) {
                    visualShader = shader;
                    return shader;
                }
            }
            catch (_) { }
        }
        return null;
    }
    function setMaterialFloat(material, name, value) {
        try {
            material.method("SetFloat", 2)
                .overload("System.String", "System.Single")
                .invoke(Il2Cpp.string(name), value);
        }
        catch (_) { }
        try {
            material.method("SetInt", 2)
                .overload("System.String", "System.Int32")
                .invoke(Il2Cpp.string(name), Math.trunc(value));
        }
        catch (_) { }
    }
    function colorVisualMaterial(material, color) {
        if (!isUnityObjectAlive(material))
            return;
        try {
            material.method("set_color", 1).invoke(color);
        }
        catch (_) { }
        for (const name of ["_Color", "_BaseColor"]) {
            try {
                material.method("SetColor", 2)
                    .overload("System.String", "UnityEngine.Color")
                    .invoke(Il2Cpp.string(name), color);
            }
            catch (_) { }
        }
    }
    function configureThroughWallMaterial(material, color) {
        if (!isUnityObjectAlive(material))
            return;
        const shader = getVisualShader();
        if (isUnityObjectAlive(shader)) {
            try {
                material.method("set_shader", 1).invoke(shader);
            }
            catch (_) { }
        }
        colorVisualMaterial(material, color);
        setMaterialFloat(material, "_ZTest", 8);
        setMaterialFloat(material, "unity_GUIZTestMode", 8);
        setMaterialFloat(material, "_ZWrite", 0);
        setMaterialFloat(material, "_Cull", 0);
        try {
            material.method("set_renderQueue", 1).invoke(5000);
        }
        catch (_) { }
    }
    function visualColorKey(color) {
        if (color[1] > 0.8 && color[0] < 0.5)
            return "green";
        if (color[0] > 0.8 && color[1] < 0.5)
            return "red";
        return "white";
    }
    function getVisualMaterial(color) {
        const key = visualColorKey(color);
        const cached = visualMaterials.get(key);
        if (isUnityObjectAlive(cached))
            return cached;
        visualMaterials.delete(key);
        const shader = getVisualShader();
        if (!isUnityObjectAlive(shader))
            return null;
        try {
            const material = Material.alloc();
            material.method(".ctor", 1)
                .overload("UnityEngine.Shader")
                .invoke(shader);
            configureThroughWallMaterial(material, color);
            visualMaterials.set(key, material);
            return material;
        }
        catch (_) {
            return null;
        }
    }
    function getVisualHpMaterial() {
        if (isUnityObjectAlive(visualHpMaterial))
            return visualHpMaterial;
        visualHpMaterial = null;
        try {
            const font = getFont();
            if (!isUnityObjectAlive(font))
                return null;
            const fontMaterial = font.method("get_material", 0).invoke();
            if (!isUnityObjectAlive(fontMaterial))
                return null;
            const material = Material.alloc();
            material.method(".ctor", 1)
                .overload("UnityEngine.Material")
                .invoke(fontMaterial);
            // Keep the font shader/atlas, but draw the label after opaque world
            // geometry so the HP remains readable through walls.
            setMaterialFloat(material, "_ZTest", 8);
            setMaterialFloat(material, "unity_GUIZTestMode", 8);
            setMaterialFloat(material, "_ZWrite", 0);
            setMaterialFloat(material, "_Cull", 0);
            try {
                material.method("set_renderQueue", 1).invoke(5000);
            }
            catch (_) { }
            visualHpMaterial = material;
            return material;
        }
        catch (_) {
            return null;
        }
    }
    function clearTracers() {
        for (const target of visualTargets.values()) {
            if (isUnityObjectAlive(target.tracer))
                destroy(target.tracer);
            target.tracer = null;
            target.tracerRenderer = null;
            target.tracerColorKey = "";
        }
    }
    function clearTargetHpLabel(target) {
        if (isUnityObjectAlive(target.hpObject))
            destroy(target.hpObject);
        target.hpObject = null;
        target.hpText = null;
        target.hpRenderer = null;
        target.hpLabel = "";
        target.hpColorKey = "";
    }
    function clearHpLabels() {
        for (const target of visualTargets.values())
            clearTargetHpLabel(target);
    }
    function destroyHitboxVisual(entry) {
        if (entry && isUnityObjectAlive(entry.object))
            destroy(entry.object);
    }
    function clearHitboxVisuals() {
        for (const entry of hitboxVisuals.values())
            destroyHitboxVisual(entry);
        hitboxVisuals.clear();
        hitboxVisualRescanFrame = -1000;
    }
    function ensureHitboxVisual(key, collider) {
        const existing = hitboxVisuals.get(key);
        if (existing && isUnityObjectAlive(existing.object) && Array.isArray(existing.lines) &&
            existing.lines.every(line => isUnityObjectAlive(line))) {
            existing.collider = collider;
            return existing;
        }
        destroyHitboxVisual(existing);
        let object = null;
        try {
            object = createEmpty("AnimalRivalsHitbox:" + key);
            getTransform(object).method("SetParent", 2).invoke(ensureVisualRoot(), false);
            const entry = { object, lines: [], collider };
            hitboxVisuals.set(key, entry);
            return entry;
        }
        catch (_) {
            if (isUnityObjectAlive(object))
                destroy(object);
            return null;
        }
    }
    function ensureHitboxVisualLine(entry, index) {
        if (!entry || !isUnityObjectAlive(entry.object))
            return null;
        if (isUnityObjectAlive(entry.lines[index]))
            return entry.lines[index];
        let lineObject = null;
        try {
            lineObject = createEmpty("AnimalRivalsHitboxStrip:" + index);
            getTransform(lineObject).method("SetParent", 2)
                .invoke(getTransform(entry.object), false);
            const line = addComponent(lineObject, LineRenderer);
            if (!isUnityObjectAlive(line))
                throw new Error("LineRenderer unavailable");
            line.method("set_useWorldSpace", 1).invoke(true);
            line.method("set_positionCount", 1).invoke(0);
            line.method("set_startWidth", 1).invoke(0.012);
            line.method("set_endWidth", 1).invoke(0.012);
            const color = [1.0, 0.08, 0.04, 0.9];
            try {
                line.method("set_startColor", 1).invoke(color);
                line.method("set_endColor", 1).invoke(color);
            }
            catch (_) { }
            const material = getVisualMaterial(color);
            if (isUnityObjectAlive(material)) {
                try {
                    line.method("set_sharedMaterial", 1).invoke(material);
                }
                catch (_) { }
            }
            entry.lines[index] = line;
            return line;
        }
        catch (_) {
            if (isUnityObjectAlive(lineObject))
                destroy(lineObject);
            return null;
        }
    }
    function addVec3(left, right) {
        return [left[0] + right[0], left[1] + right[1], left[2] + right[2]];
    }
    function scaleVec3(value, scalar) {
        return [value[0] * scalar, value[1] * scalar, value[2] * scalar];
    }
    function localCirclePoints(center, firstAxis, secondAxis, radius, segments = 10) {
        const points = [];
        for (let index = 0; index <= segments; index++) {
            const angle = Math.PI * 2.0 * index / segments;
            points.push(addVec3(center, addVec3(
                scaleVec3(firstAxis, Math.cos(angle) * radius),
                scaleVec3(secondAxis, Math.sin(angle) * radius),
            )));
        }
        return points;
    }
    function colliderLocalWireStrips(collider) {
        const className = String(collider.class?.name || collider.class?.fullName || "");
        const center = readColliderVectorValue(collider, "center") || [0, 0, 0];
        if (/BoxCollider$/i.test(className)) {
            const size = readColliderVectorValue(collider, "size");
            if (!size)
                return [];
            const x0 = center[0] - size[0] * 0.5;
            const x1 = center[0] + size[0] * 0.5;
            const y0 = center[1] - size[1] * 0.5;
            const y1 = center[1] + size[1] * 0.5;
            const z0 = center[2] - size[2] * 0.5;
            const z1 = center[2] + size[2] * 0.5;
            return [[
                [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1],
                [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0],
                [x1, y1, z0], [x1, y1, z1], [x1, y0, z1], [x1, y1, z1],
                [x0, y1, z1], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0],
            ]];
        }
        if (/SphereCollider$/i.test(className)) {
            const radius = readColliderFieldValue(collider, "radius");
            if (!Number.isFinite(radius) || radius <= 0)
                return [];
            return [
                localCirclePoints(center, [1, 0, 0], [0, 1, 0], radius),
                localCirclePoints(center, [1, 0, 0], [0, 0, 1], radius),
                localCirclePoints(center, [0, 1, 0], [0, 0, 1], radius),
            ];
        }
        if (/CapsuleCollider$/i.test(className)) {
            const radius = readColliderFieldValue(collider, "radius");
            const height = readColliderFieldValue(collider, "height");
            const direction = Math.trunc(readColliderFieldValue(collider, "direction"));
            if (!Number.isFinite(radius) || !Number.isFinite(height) || radius <= 0 || height <= 0)
                return [];
            const axis = direction === 0 ? [1, 0, 0] : direction === 2 ? [0, 0, 1] : [0, 1, 0];
            const first = direction === 0 ? [0, 1, 0] : [1, 0, 0];
            const second = direction === 2 ? [0, 1, 0] : [0, 0, 1];
            const straightHalf = Math.max(0, height * 0.5 - radius);
            const top = addVec3(center, scaleVec3(axis, straightHalf));
            const bottom = addVec3(center, scaleVec3(axis, -straightHalf));
            const strips = [
                localCirclePoints(top, first, second, radius),
                localCirclePoints(bottom, first, second, radius),
            ];
            const appendSilhouette = (sideAxis) => {
                const points = [];
                for (let index = 0; index <= 6; index++) {
                    const angle = Math.PI * index / 6;
                    points.push(addVec3(top, addVec3(
                        scaleVec3(sideAxis, Math.cos(angle) * radius),
                        scaleVec3(axis, Math.sin(angle) * radius),
                    )));
                }
                points.push(addVec3(bottom, scaleVec3(sideAxis, -radius)));
                for (let index = 6; index <= 12; index++) {
                    const angle = Math.PI * index / 6;
                    points.push(addVec3(bottom, addVec3(
                        scaleVec3(sideAxis, Math.cos(angle) * radius),
                        scaleVec3(axis, Math.sin(angle) * radius),
                    )));
                }
                points.push(addVec3(top, scaleVec3(sideAxis, radius)));
                strips.push(points);
            };
            appendSilhouette(first);
            appendSilhouette(second);
            return strips;
        }
        return [];
    }
    function updateHitboxVisualBounds(entry) {
        if (!entry || !isDamageHitboxCollider(entry.collider) || !isUnityObjectAlive(entry.object))
            return false;
        try {
            const object = componentGameObject(entry.collider);
            const transform = isUnityObjectAlive(object) ? getTransform(object) : null;
            const strips = colliderLocalWireStrips(entry.collider);
            if (!isUnityObjectAlive(transform) || strips.length === 0)
                return false;
            for (let stripIndex = 0; stripIndex < strips.length; stripIndex++) {
                const line = ensureHitboxVisualLine(entry, stripIndex);
                const localPoints = strips[stripIndex];
                if (!isUnityObjectAlive(line) || localPoints.length === 0)
                    return false;
                line.method("set_positionCount", 1).invoke(localPoints.length);
                for (let pointIndex = 0; pointIndex < localPoints.length; pointIndex++) {
                    const world = transform.method("TransformPoint", 1).invoke(localPoints[pointIndex]);
                    line.method("SetPosition", 2).invoke(pointIndex, world);
                }
            }
            for (let index = strips.length; index < entry.lines.length; index++) {
                if (isUnityObjectAlive(entry.lines[index]))
                    entry.lines[index].method("set_positionCount", 1).invoke(0);
            }
            return true;
        }
        catch (_) {
            return false;
        }
    }
    function updateHitboxVisuals() {
        if (!mods.showHitboxes) {
            if (hitboxVisuals.size > 0)
                clearHitboxVisuals();
            return;
        }
        if (frameNumber % HITBOX_VISUAL_REFRESH_FRAMES !== 0)
            return;
        if (frameNumber >= hitboxVisualRescanFrame) {
            hitboxVisualRescanFrame = frameNumber + HITBOX_VISUAL_RESCAN_FRAMES;
            const players = objectsOfClass(NetworkPlayer);
            const local = findLocalNetworkPlayer(players);
            const active = new Set();
            for (const remote of players.concat(activeBots())) {
                if (active.size >= MAX_HITBOX_VISUALS)
                    break;
                if (!isUnityObjectAlive(remote) || (!isBot(remote) && isLocalNetworkTarget(remote, local)))
                    continue;
                let targetVisualCount = 0;
                for (const collider of collectDamageHitboxColliders(remote)) {
                    if (active.size >= MAX_HITBOX_VISUALS ||
                        targetVisualCount >= MAX_HITBOX_VISUALS_PER_TARGET) {
                        break;
                    }
                    const key = visualObjectKey(collider);
                    if (!key || active.has(key))
                        continue;
                    active.add(key);
                    targetVisualCount++;
                    ensureHitboxVisual(key, collider);
                }
            }
            for (const [key, entry] of Array.from(hitboxVisuals.entries())) {
                if (active.has(key))
                    continue;
                destroyHitboxVisual(entry);
                hitboxVisuals.delete(key);
            }
        }
        for (const [key, entry] of Array.from(hitboxVisuals.entries())) {
            if (updateHitboxVisualBounds(entry))
                continue;
            destroyHitboxVisual(entry);
            hitboxVisuals.delete(key);
        }
    }
    function restoreTargetChams(target) {
        for (const entry of target.chamRenderers || []) {
            if (!isUnityObjectAlive(entry.renderer))
                continue;
            if (isUnityObjectAlive(entry.originalMaterial)) {
                try {
                    entry.renderer.method("set_sharedMaterial", 1).invoke(entry.originalMaterial);
                }
                catch (_) { }
            }
        }
        target.chamRenderers = [];
        target.chamColorKey = "";
        target.lastChamScanFrame = -1000;
    }
    function restoreChams() {
        for (const target of visualTargets.values())
            restoreTargetChams(target);
    }
    function clearVisuals(dropStaleChams = false) {
        clearTracers();
        clearHpLabels();
        clearHitboxVisuals();
        if (dropStaleChams) {
            for (const target of visualTargets.values()) {
                target.chamRenderers = [];
                target.chamColorKey = "";
            }
        }
        else {
            restoreChams();
        }
        if (isUnityObjectAlive(visualRoot))
            destroy(visualRoot);
        for (const material of visualMaterials.values()) {
            if (isUnityObjectAlive(material))
                destroy(material);
        }
        if (isUnityObjectAlive(visualHpMaterial))
            destroy(visualHpMaterial);
        visualRoot = null;
        visualTargets.clear();
        visualMaterials.clear();
        visualHpMaterial = null;
        visualShader = null;
        lastVisualScanFrame = -1000;
        chamScanCursor = 0;
        lastMatchModeScanFrame = -1000;
        cachedMatchModeActive = false;
        focusCleanupPending = false;
    }
    function teamKeyFromValue(value, depth = 0) {
        if (value == null || depth > 2)
            return null;
        if (typeof value === "number" || typeof value === "bigint") {
            const number = Number(value);
            return Number.isFinite(number) && number >= 0 && number < 256
                ? "n:" + Math.trunc(number)
                : null;
        }
        if (typeof value === "string") {
            const normalized = value.trim();
            return normalized ? "s:" + normalized.toLowerCase() : null;
        }
        try {
            const enumValue = value.field("value__").value;
            const key = teamKeyFromValue(enumValue, depth + 1);
            if (key)
                return key;
        }
        catch (_) { }
        for (const name of ["get_TeamNumber", "get_TeamId", "get_TeamID", "get_Id", "get_ID", "get_Index", "get_Value"]) {
            try {
                const key = teamKeyFromValue(value.method(name, 0).invoke(), depth + 1);
                if (key)
                    return key;
            }
            catch (_) { }
        }
        for (const name of ["_TeamNumber", "TeamNumber", "teamNumber", "TeamId", "teamId", "Id", "id", "Index", "index"]) {
            try {
                const key = teamKeyFromValue(value.field(name).value, depth + 1);
                if (key)
                    return key;
            }
            catch (_) { }
        }
        try {
            const className = String(value.class?.fullName || value.class?.name || "");
            if (/(team|side)/i.test(className) && value.handle)
                return "o:" + String(value.handle);
        }
        catch (_) { }
        return null;
    }
    function readTeamIdUncached(player) {
        const methods = [
            "get_TeamNumber", "get_Team", "get_TeamId", "get_TeamID", "get_TeamIndex",
            "get_PlayerTeam", "get_CurrentTeam", "get_TeamNumber", "get_Side",
        ];
        for (const name of methods) {
            try {
                const key = teamKeyFromValue(player.method(name, 0).invoke());
                if (key)
                    return key;
            }
            catch (_) { }
        }
        const fields = [
            "_TeamNumber", "TeamNumber", "teamNumber", "_teamNumber",
            "Team", "team", "_team", "TeamId", "teamId", "_teamId", "TeamID", "teamID",
            "TeamIndex", "teamIndex", "PlayerTeam", "playerTeam", "CurrentTeam", "currentTeam",
            "Side", "side", "<Team>k__BackingField", "<TeamId>k__BackingField",
        ];
        for (const name of fields) {
            try {
                const key = teamKeyFromValue(player.field(name).value);
                if (key)
                    return key;
            }
            catch (_) { }
        }
        if (discoveredTeamGetterNames === null || discoveredTeamFieldNames === null) {
            discoveredTeamGetterNames = [];
            discoveredTeamFieldNames = [];
            try {
                for (const method of player.class.methods) {
                    const name = String(method.name);
                    if (method.parameterCount === 0 && /^get_/.test(name) && /(team|side)/i.test(name)) {
                        discoveredTeamGetterNames.push(name);
                    }
                }
                for (const field of player.class.fields) {
                    const name = String(field.name);
                    if (/(team|side)/i.test(name))
                        discoveredTeamFieldNames.push(name);
                }
            }
            catch (_) { }
        }
        for (const name of discoveredTeamGetterNames) {
            try {
                const method = player.method(name, 0);
                const returnName = String(method.returnType?.name || "");
                if (!/(team|side|string|byte|int|enum)/i.test(returnName))
                    continue;
                const key = teamKeyFromValue(method.invoke());
                if (key)
                    return key;
            }
            catch (_) { }
        }
        for (const name of discoveredTeamFieldNames) {
            try {
                const key = teamKeyFromValue(player.field(name).value);
                if (key)
                    return key;
            }
            catch (_) { }
        }
        return null;
    }
    function readTeamId(player) {
        if (!isUnityObjectAlive(player))
            return null;
        const key = String(visualObjectKey(player));
        if (key) {
            const cached = teamKeyCache.get(key);
            if (cached && frameNumber < cached.expires)
                return cached.value;
        }
        const value = readTeamIdUncached(player);
        if (key) {
            teamKeyCache.set(key, {
                value,
                expires: frameNumber + (value === null ? 30 : 180),
            });
        }
        return value;
    }
    function visualColor(teamMatch, localTeam, targetTeam) {
        if (!teamMatch)
            return [1, 1, 1, 0.88];
        if (localTeam !== null && targetTeam !== null && targetTeam === localTeam) {
            return [0.10, 1.0, 0.20, 0.88];
        }
        // A confirmed match must not fall back to lobby-white. Unknown teams
        // occur in 1v1/FFA modes and are enemies from the local perspective.
        return [1.0, 0.08, 0.08, 0.88];
    }
    function concreteMatchModeIsActive() {
        if (frameNumber - lastMatchModeScanFrame < 60)
            return cachedMatchModeActive;
        lastMatchModeScanFrame = frameNumber;
        cachedMatchModeActive = false;
        for (const klass of MatchModeClasses) {
            if (objectsOfClass(klass).some(componentIsActiveInScene)) {
                cachedMatchModeActive = true;
                break;
            }
        }
        if (!cachedMatchModeActive) {
            try {
                const players = objectsOfClass(NetworkPlayer);
                if (players.length >= 2) {
                    const teams = new Set();
                    let unknown = 0;
                    for (const player of players) {
                        if (!isUnityObjectAlive(player))
                            continue;
                        const team = readTeamId(player);
                        if (team)
                            teams.add(team);
                        else
                            unknown++;
                    }
                    if (teams.size >= 2)
                        cachedMatchModeActive = true;
                    else if (teams.size === 1 && unknown === 0 && players.length >= 2)
                        cachedMatchModeActive = true;
                }
            }
            catch (_) { }
        }
        return cachedMatchModeActive;
    }
    function ensureVisualRoot() {
        if (!isUnityObjectAlive(visualRoot))
            visualRoot = createEmpty("AnimalRivalsVisuals");
        return getTransform(visualRoot);
    }
    function ensureTracer(target) {
        if (isUnityObjectAlive(target.tracer) && isUnityObjectAlive(target.tracerRenderer))
            return;
        try {
            const object = createEmpty("AnimalRivalsTracer:" + target.key);
            getTransform(object).method("SetParent", 2).invoke(ensureVisualRoot(), false);
            const line = addComponent(object, LineRenderer);
            line.method("set_useWorldSpace", 1).invoke(true);
            line.method("set_positionCount", 1).invoke(2);
            line.method("set_startWidth", 1).invoke(0.008);
            line.method("set_endWidth", 1).invoke(0.008);
            try {
                line.method("set_numCornerVertices", 1).invoke(2);
            }
            catch (_) { }
            try {
                line.method("set_numCapVertices", 1).invoke(2);
            }
            catch (_) { }
            target.tracer = object;
            target.tracerRenderer = line;
            target.tracerColorKey = "";
            applyTracerColor(target);
        }
        catch (_) {
            target.tracer = null;
            target.tracerRenderer = null;
        }
    }
    function applyTracerColor(target) {
        if (!isUnityObjectAlive(target.tracerRenderer))
            return;
        const colorKey = visualColorKey(target.color);
        if (target.tracerColorKey === colorKey)
            return;
        const material = getVisualMaterial(target.color);
        try {
            target.tracerRenderer.method("set_startColor", 1).invoke(target.color);
        }
        catch (_) { }
        try {
            target.tracerRenderer.method("set_endColor", 1).invoke(target.color);
        }
        catch (_) { }
        if (isUnityObjectAlive(material)) {
            try {
                target.tracerRenderer.method("set_sharedMaterial", 1).invoke(material);
            }
            catch (_) { }
        }
        target.tracerColorKey = colorKey;
    }
    function hierarchyGameObject(value) {
        if (!isUnityObjectAlive(value))
            return null;
        try {
            if (GameObject.isAssignableFrom(value.class))
                return value;
        }
        catch (_) { }
        return componentGameObject(value);
    }
    function visualHierarchyRoots(player) {
        if (isBot(player)) return botRoots(player);
        const roots = [];
        const addRoot = (value) => {
            const object = hierarchyGameObject(value);
            if (!isUnityObjectAlive(object))
                return;
            if (!roots.some(existing => sameObject(existing, object)))
                roots.push(object);
        };
        for (const fieldName of ["networkRig", "playerAvatar", "avatar", "rig", "body", "playerBody"]) {
            try {
                addRoot(player.field(fieldName).value);
            }
            catch (_) { }
        }
        if (discoveredVisualRootFieldNames === null) {
            discoveredVisualRootFieldNames = [];
            try {
                for (const field of player.class.fields) {
                    const name = String(field.name);
                    if (/(rig|avatar|body|model|character)/i.test(name)) {
                        discoveredVisualRootFieldNames.push(name);
                    }
                }
            }
            catch (_) { }
        }
        for (const fieldName of discoveredVisualRootFieldNames) {
            try {
                addRoot(player.field(fieldName).value);
            }
            catch (_) { }
        }
        if (roots.length === 0)
            addRoot(player);
        return roots;
    }
    function rendererIsChamCandidate(renderer) {
        if (!isUnityObjectAlive(renderer))
            return false;
        try {
            const object = componentGameObject(renderer);
            const name = objectName(object);
            if (/(particle|trail|muzzle|projectile|canvas|text|ui|name.?tag)/i.test(name))
                return false;
        }
        catch (_) { }
        return true;
    }
    function childRenderers(root, klass) {
        const values = [];
        const seen = new Set();
        const add = (sourceClass) => {
            if (!sourceClass)
                return;
            try {
                const components = root.method("GetComponentsInChildren", 2)
                    .overload("System.Type", "System.Boolean")
                    .invoke(sourceClass.type.object, true);
                for (const component of objectArrayValues(components)) {
                    const key = visualObjectKey(component);
                    if (key && !seen.has(key)) {
                        seen.add(key);
                        values.push(component);
                    }
                }
            }
            catch (_) {
                try {
                    const components = root.method("GetComponentsInChildren", 1)
                        .overload("System.Type")
                        .invoke(sourceClass.type.object);
                    for (const component of objectArrayValues(components)) {
                        const key = visualObjectKey(component);
                        if (key && !seen.has(key)) {
                            seen.add(key);
                            values.push(component);
                        }
                    }
                }
                catch (_) { }
            }
        };
        add(klass);
        return values;
    }
    function fallbackSceneRenderersForRoot(root) {
        if (!isUnityObjectAlive(root))
            return [];
        const roots = [root];
        const results = [];
        const seen = new Set();
        for (const renderer of objectsOfClass(Renderer, true)) {
            const object = componentGameObject(renderer);
            if (!isUnityObjectAlive(object))
                continue;
            if (!isUnityObjectAlive(getTransform(object)))
                continue;
            if (!objectIsWithinRoots(object, roots))
                continue;
            const key = visualObjectKey(renderer);
            if (!key || seen.has(key))
                continue;
            seen.add(key);
            results.push(renderer);
        }
        return results;
    }
    function scalarHealthValue(value, depth = 0) {
        if (depth > 2 || value == null)
            return Number.NaN;
        const direct = numericValue(value);
        if (Number.isFinite(direct))
            return direct;
        for (const methodName of ["get_Value", "get_CurrentValue", "get_RawValue"]) {
            try {
                const number = scalarHealthValue(value.method(methodName, 0).invoke(), depth + 1);
                if (Number.isFinite(number))
                    return number;
            }
            catch (_) { }
        }
        for (const fieldName of ["value", "_value", "Value", "CurrentValue", "_currentValue", "<Value>k__BackingField"]) {
            try {
                const number = scalarHealthValue(value.field(fieldName).value, depth + 1);
                if (Number.isFinite(number))
                    return number;
            }
            catch (_) { }
        }
        return Number.NaN;
    }
    function readNetworkPlayerHealth(player) {
        if (isBot(player)) {
            try { return Number(player.method("get_DamageReceiver", 0).invoke().method("get_DisplayHealth", 0).invoke()); }
            catch (_) { return Number.NaN; }
        }
        let health = null;
        try {
            // This is the pinned build's exact network-player health accessor.
            health = player.method("get_DLAR_Player_Health", 0).invoke();
        }
        catch (_) {
            return Number.NaN;
        }
        if (health == null)
            return Number.NaN;
        const direct = scalarHealthValue(health);
        if (Number.isFinite(direct))
            return direct;
        if (cachedHealthValueAccessor) {
            try {
                const value = cachedHealthValueAccessor.kind === "method"
                    ? health.method(cachedHealthValueAccessor.name, 0).invoke()
                    : health.field(cachedHealthValueAccessor.name).value;
                const number = scalarHealthValue(value);
                if (Number.isFinite(number))
                    return number;
            }
            catch (_) { }
            cachedHealthValueAccessor = null;
        }
        for (const name of [
            "get_CurrentHealth", "get_currentHealth", "get_Health", "get_health",
            "get_CurrentHP", "get_HP", "get_CurrentHitPoints", "GetCurrentHealth",
            "GetHealth", "get_HealthValue", "GetHealthValue",
        ]) {
            try {
                const number = scalarHealthValue(health.method(name, 0).invoke());
                if (!Number.isFinite(number))
                    continue;
                cachedHealthValueAccessor = { kind: "method", name };
                return number;
            }
            catch (_) { }
        }
        for (const name of [
            "currentHealth", "_currentHealth", "CurrentHealth", "health", "_health", "Health",
            "currentHP", "_currentHP", "CurrentHP", "HP",
            "<CurrentHealth>k__BackingField", "<Health>k__BackingField",
        ]) {
            try {
                const number = scalarHealthValue(health.field(name).value);
                if (!Number.isFinite(number))
                    continue;
                cachedHealthValueAccessor = { kind: "field", name };
                return number;
            }
            catch (_) { }
        }
        return Number.NaN;
    }
    function applyHpLabelColor(target) {
        if (!isUnityObjectAlive(target.hpText))
            return;
        const colorKey = visualColorKey(target.color);
        if (target.hpColorKey === colorKey)
            return;
        const color = [target.color[0], target.color[1], target.color[2], 1.0];
        try {
            target.hpText.method("set_color", 1).invoke(color);
        }
        catch (_) { }
        target.hpColorKey = colorKey;
    }
    function ensureHpLabel(target) {
        if (isUnityObjectAlive(target.hpObject) && isUnityObjectAlive(target.hpText)) {
            applyHpLabelColor(target);
            return;
        }
        clearTargetHpLabel(target);
        let object = null;
        try {
            object = createEmpty("AnimalRivalsHp:" + target.key);
            const transform = getTransform(object);
            transform.method("SetParent", 2).invoke(ensureVisualRoot(), false);
            transform.method("set_localScale", 1).invoke([1, 1, 1]);
            const text = addComponent(object, TextMesh);
            if (!isUnityObjectAlive(text))
                throw new Error("TextMesh unavailable");
            const font = getFont();
            if (isUnityObjectAlive(font)) {
                try {
                    text.method("set_font", 1).invoke(font);
                }
                catch (_) { }
            }
            text.method("set_text", 1).invoke(Il2Cpp.string("HP: ?"));
            try {
                text.method("set_fontSize", 1).invoke(64);
            }
            catch (_) { }
            try {
                text.method("set_characterSize", 1).invoke(0.032);
            }
            catch (_) { }
            try {
                text.method("set_fontStyle", 1).invoke(1);
            }
            catch (_) { }
            try {
                text.method("set_anchor", 1).invoke(7);
            }
            catch (_) { }
            try {
                text.method("set_alignment", 1).invoke(1);
            }
            catch (_) { }
            try {
                text.method("set_richText", 1).invoke(false);
            }
            catch (_) { }
            const renderer = getComponent(object, Renderer);
            if (isUnityObjectAlive(renderer)) {
                const material = getVisualHpMaterial();
                if (isUnityObjectAlive(material)) {
                    try {
                        renderer.method("set_sharedMaterial", 1).invoke(material);
                    }
                    catch (_) { }
                }
                try {
                    renderer.method("set_sortingOrder", 1).invoke(32767);
                }
                catch (_) { }
                try {
                    renderer.method("set_enabled", 1).invoke(true);
                }
                catch (_) { }
            }
            target.hpObject = object;
            target.hpText = text;
            target.hpRenderer = renderer;
            target.hpLabel = "";
            target.hpColorKey = "";
            applyHpLabelColor(target);
        }
        catch (_) {
            if (isUnityObjectAlive(object))
                destroy(object);
            clearTargetHpLabel(target);
        }
    }
    function formatHealth(value) {
        if (!Number.isFinite(value))
            return "HP: ?";
        const clamped = Math.max(0, Math.min(99999, value));
        return "HP: " + (Math.abs(clamped - Math.round(clamped)) < 0.05
            ? String(Math.round(clamped))
            : clamped.toFixed(1));
    }
    function updateHpLabels() {
        let cameraRotation = null;
        try {
            const camera = Camera.method("get_main", 0).invoke();
            if (isUnityObjectAlive(camera)) {
                const rawRotation = getTransform(camera).method("get_rotation", 0).invoke();
                cameraRotation = Quaternion.method("op_Multiply", 2).invoke(rawRotation, Quaternion.method("Euler", 3).invoke(0, 180, 0));
            }
        }
        catch (_) { }
        for (const target of visualTargets.values()) {
            if (!isUnityObjectAlive(target.player))
                continue;
            ensureHpLabel(target);
            if (!isUnityObjectAlive(target.hpObject) || !isUnityObjectAlive(target.hpText))
                continue;
            if (frameNumber % HP_TEXT_REFRESH_FRAMES === 0 || !target.hpLabel) {
                const label = formatHealth(readNetworkPlayerHealth(target.player));
                if (label !== target.hpLabel) {
                    try {
                        target.hpText.method("set_text", 1).invoke(Il2Cpp.string(label));
                    }
                    catch (_) { }
                    target.hpLabel = label;
                }
            }
            const head = networkPlayerHeadPosition(target.player);
            if (!head)
                continue;
            try {
                const transform = getTransform(target.hpObject);
                transform.method("set_position", 1).invoke([head[0], head[1] + 0.18, head[2]]);
                if (cameraRotation)
                    transform.method("set_rotation", 1).invoke(cameraRotation);
            }
            catch (_) { }
        }
    }
    function localAvatarRoots(player) {
        if (isBot(player)) return botRoots(player);
        const roots = [];
        const addRoot = (value) => {
            const object = hierarchyGameObject(value);
            if (!isUnityObjectAlive(object))
                return;
            if (!roots.some(existing => sameObject(existing, object)))
                roots.push(object);
        };
        for (const fieldName of ["networkRig", "playerAvatar", "avatar", "rig", "body", "playerBody"]) {
            try {
                addRoot(player.field(fieldName).value);
            }
            catch (_) { }
        }
        if (discoveredVisualRootFieldNames === null) {
            discoveredVisualRootFieldNames = [];
            try {
                for (const field of player.class.fields) {
                    const name = String(field.name);
                    if (/(rig|avatar|body|model|character)/i.test(name)) {
                        discoveredVisualRootFieldNames.push(name);
                    }
                }
            }
            catch (_) { }
        }
        if (discoveredVisualRootFieldNames) {
            for (const fieldName of discoveredVisualRootFieldNames) {
                try {
                    addRoot(player.field(fieldName).value);
                }
                catch (_) { }
            }
        }
        // Only fall back to the whole network-player hierarchy when the build
        // exposes no separate body/rig reference. Held items are still filtered.
        if (roots.length === 0)
            addRoot(player);
        return roots;
    }
    function objectIsWithinRoots(object, roots) {
        if (!isUnityObjectAlive(object))
            return false;
        let transform = null;
        try {
            transform = getTransform(object);
        }
        catch (_) {
            return false;
        }
        for (const root of roots) {
            if (!isUnityObjectAlive(root))
                continue;
            try {
                if (sameObject(object, root) ||
                    !!transform.method("IsChildOf", 1).invoke(getTransform(root)))
                    return true;
            }
            catch (_) { }
        }
        return false;
    }
    function rendererHasExcludedOwner(renderer, heldRoots) {
        const object = componentGameObject(renderer);
        if (!isUnityObjectAlive(object))
            return true;
        if (objectIsWithinRoots(object, heldRoots))
            return true;
        let transform = null;
        try {
            transform = getTransform(object);
        }
        catch (_) {
            return true;
        }
        for (let depth = 0; depth < 10 && isUnityObjectAlive(transform); depth++) {
            try {
                const owner = transform.method("get_gameObject", 0).invoke();
                const name = String(owner.method("get_name", 0).invoke());
                if (/(weapon|gun|item|holster|muzzle|projectile|grenade|clipboard|animalrivals(menu|visual|vfx|platform))/i.test(name)) {
                    return true;
                }
                transform = transform.method("get_parent", 0).invoke();
            }
            catch (_) {
                break;
            }
        }
        return false;
    }
    function restoreInvisibleRenderer(entry) {
        if (!entry || !isUnityObjectAlive(entry.renderer))
            return;
        try {
            entry.renderer.method("set_enabled", 1).invoke(!!entry.enabled);
        }
        catch (_) { }
    }
    function networkPlayerAvatarObject(player) {
        if (!isUnityObjectAlive(player))
            return null;
        try {
            return hierarchyGameObject(player.field("playerAvatar").value);
        }
        catch (_) {
            return null;
        }
    }
    function setObjectLayerRecursively(root, layer) {
        if (!isUnityObjectAlive(root) || !Number.isFinite(layer) || layer < 0 || layer > 31)
            return;
        const pending = [root];
        let visited = 0;
        while (pending.length > 0 && visited < 256) {
            const object = pending.pop();
            visited++;
            if (!isUnityObjectAlive(object))
                continue;
            try {
                object.method("set_layer", 1).invoke(Math.trunc(layer));
            }
            catch (_) { }
            try {
                const transform = getTransform(object);
                const childCount = Number(transform.method("get_childCount", 0).invoke());
                for (let index = 0; index < childCount; index++) {
                    const child = transform.method("GetChild", 1).invoke(index);
                    const childObject = child.method("get_gameObject", 0).invoke();
                    if (isUnityObjectAlive(childObject))
                        pending.push(childObject);
                }
            }
            catch (_) { }
        }
    }
    function setNetworkAvatarLayer(player, layerName) {
        if (!isUnityObjectAlive(player) || !layerName)
            return false;
        try {
            player.method("RPC_SetPlayerAvatarLayer", 1)
                .overload("System.String")
                .invoke(Il2Cpp.string(layerName));
            return true;
        }
        catch (_) {
            return false;
        }
    }
    function applyInvisibilityNetworkLayer(player) {
        if (invisibilityLayerRpcApplied && sameObject(invisibilityLayerRpcPlayer, player))
            return;
        if (invisibilityLayerRpcApplied)
            restoreInvisibilityNetworkLayer();
        const avatar = networkPlayerAvatarObject(player);
        let originalLayer = -1;
        if (isUnityObjectAlive(avatar)) {
            try {
                originalLayer = Number(avatar.method("get_layer", 0).invoke());
            }
            catch (_) { }
        }
        if (!setNetworkAvatarLayer(player, "MyLocalAvatar"))
            return;
        invisibilityLayerRpcPlayer = player;
        invisibilityOriginalLayer = originalLayer;
        invisibilityLayerRpcApplied = true;
    }
    function restoreInvisibilityNetworkLayer() {
        const player = invisibilityLayerRpcPlayer;
        const originalLayer = invisibilityOriginalLayer;
        invisibilityLayerRpcPlayer = null;
        invisibilityOriginalLayer = -1;
        const wasApplied = invisibilityLayerRpcApplied;
        invisibilityLayerRpcApplied = false;
        if (!wasApplied || !isUnityObjectAlive(player))
            return;
        // Remote clients should render this avatar normally again. Restore the
        // caller's original local layer immediately afterwards.
        setNetworkAvatarLayer(player, "MyNetworkAvatar");
        const avatar = networkPlayerAvatarObject(player);
        if (isUnityObjectAlive(avatar) && originalLayer >= 0)
            setObjectLayerRecursively(avatar, originalLayer);
    }
    function restoreInvisibility() {
        restoreInvisibilityNetworkLayer();
        for (const entry of invisibleRenderers.values())
            restoreInvisibleRenderer(entry);
        invisibleRenderers.clear();
        invisibilityPlayer = null;
        lastInvisibilityScanFrame = -1000;
    }
    function scanInvisibilityRenderers(player) {
        applyInvisibilityNetworkLayer(player);
        const heldRoots = getLocalHeldWeapons()
            .map(hierarchyGameObject)
            .filter(isUnityObjectAlive);
        const previous = new Map(invisibleRenderers);
        const next = new Map();
        const seen = new Set();
        for (const root of localAvatarRoots(player)) {
            for (const klass of [SkinnedMeshRenderer, MeshRenderer]) {
                for (const renderer of childRenderers(root, klass)) {
                    const key = visualObjectKey(renderer);
                    if (!key || seen.has(key) || !rendererIsChamCandidate(renderer))
                        continue;
                    seen.add(key);
                    const oldEntry = previous.get(key);
                    previous.delete(key);
                    if (rendererHasExcludedOwner(renderer, heldRoots)) {
                        if (oldEntry)
                            restoreInvisibleRenderer(oldEntry);
                        continue;
                    }
                    let entry = oldEntry;
                    if (!entry) {
                        let enabled = true;
                        try {
                            enabled = !!renderer.method("get_enabled", 0).invoke();
                        }
                        catch (_) { }
                        entry = { renderer, enabled };
                    }
                    try {
                        renderer.method("set_enabled", 1).invoke(false);
                    }
                    catch (_) { }
                    next.set(key, entry);
                }
            }
        }
        for (const entry of previous.values())
            restoreInvisibleRenderer(entry);
        invisibleRenderers = next;
        invisibilityPlayer = player;
        lastInvisibilityScanFrame = frameNumber;
    }
    function updateInvisibility() {
        if (!mods.invisibility) {
            if (invisibleRenderers.size > 0 || isLive(invisibilityPlayer))
                restoreInvisibility();
            return;
        }
        if (isUnityObjectAlive(invisibilityPlayer) &&
            frameNumber - lastInvisibilityScanFrame < INVISIBILITY_RESCAN_FRAMES) {
            // Renderer/LOD code may turn a body part back on. Reassert only the
            // already-cached renderers; the hierarchy scan remains throttled.
            if (frameNumber % 15 === 0) {
                for (const entry of invisibleRenderers.values()) {
                    if (!isUnityObjectAlive(entry.renderer))
                        continue;
                    try {
                        entry.renderer.method("set_enabled", 1).invoke(false);
                    }
                    catch (_) { }
                }
            }
            return;
        }
        const players = objectsOfClass(NetworkPlayer);
        const local = findLocalNetworkPlayer(players);
        if (!isUnityObjectAlive(local)) {
            restoreInvisibility();
            return;
        }
        if (isUnityObjectAlive(invisibilityPlayer) && !sameObject(invisibilityPlayer, local)) {
            restoreInvisibility();
        }
        scanInvisibilityRenderers(local);
    }
    function applyChamMaterial(target) {
        const colorKey = visualColorKey(target.color);
        const material = getVisualMaterial(target.color);
        if (!isUnityObjectAlive(material))
            return;
        let allApplied = true;
        for (const entry of target.chamRenderers || []) {
            if (!isUnityObjectAlive(entry.renderer) || entry.colorKey === colorKey)
                continue;
            let applied = false;
            // Replacing an entire native Material[] repeatedly can abort the
            // Unity player when an avatar swaps LODs mid-frame. A single
            // shared-material assignment is stable and still colors the rig.
            try {
                entry.renderer.method("set_sharedMaterial", 1).invoke(material);
                applied = true;
            }
            catch (_) { }
            if (applied) {
                entry.colorKey = colorKey;
            }
            else
                allApplied = false;
        }
        target.chamColorKey = allApplied ? colorKey : "";
    }
    function scanTargetChamRenderers(target) {
        const previous = new Map();
        for (const entry of target.chamRenderers || []) {
            previous.set(visualObjectKey(entry.renderer), entry);
        }
        const next = [];
        const seen = new Set();
        const roots = visualHierarchyRoots(target.player);
        for (const root of roots) {
            for (const klass of (isBot(target.player) ? [SkinnedMeshRenderer, MeshRenderer] : [SkinnedMeshRenderer])) {
                for (const renderer of childRenderers(root, klass)) {
                    if (next.length >= MAX_CHAM_RENDERERS_PER_TARGET)
                        break;
                    const key = visualObjectKey(renderer);
                    if (!key || seen.has(key) || !rendererIsChamCandidate(renderer))
                        continue;
                    seen.add(key);
                    const existing = previous.get(key);
                    if (existing) {
                        next.push(existing);
                        previous.delete(key);
                        continue;
                    }
                    try {
                        const originalMaterial = renderer.method("get_sharedMaterial", 0).invoke();
                        if (isUnityObjectAlive(originalMaterial)) {
                            next.push({ renderer, originalMaterial, colorKey: "" });
                        }
                    }
                    catch (_) { }
                }
            }
            if (next.length >= MAX_CHAM_RENDERERS_PER_TARGET)
                break;
        }
        for (const entry of previous.values()) {
            if (!isUnityObjectAlive(entry.renderer))
                continue;
            if (isUnityObjectAlive(entry.originalMaterial)) {
                try {
                    entry.renderer.method("set_sharedMaterial", 1).invoke(entry.originalMaterial);
                }
                catch (_) { }
            }
        }
        target.chamRenderers = next;
        target.lastChamScanFrame = frameNumber;
        applyChamMaterial(target);
    }
    function scanVisualTargets() {
        const players = objectsOfClass(NetworkPlayer);
        const local = findLocalNetworkPlayer(players);
        const remotes = players
            .filter(player => !isLocalNetworkTarget(player, local) && isUnityObjectAlive(player))
            .concat(activeBots())
            .slice(0, MAX_VISUAL_TARGETS);
        const localTeam = isLive(local) ? readTeamId(local) : null;
        const remoteTeams = remotes.map(target => isBot(target) ? null : readTeamId(target));
        const teamMatch = concreteMatchModeIsActive();
        const activeKeys = new Set();
        remotes.forEach((player, index) => {
            const key = visualObjectKey(player);
            if (!key || !isUnityObjectAlive(player))
                return;
            activeKeys.add(key);
            const color = isBot(player) ? [1, .35, .1, 1] : visualColor(teamMatch, localTeam, remoteTeams[index]);
            let target = visualTargets.get(key);
            if (!target) {
                target = {
                    key, player, color, tracer: null, tracerRenderer: null,
                    tracerColorKey: "", chamColorKey: "", chamRenderers: [],
                    hpObject: null, hpText: null, hpRenderer: null,
                    hpLabel: "", hpColorKey: "",
                    lastChamScanFrame: -1000,
                };
                visualTargets.set(key, target);
            }
            target.player = player;
            target.color = color;
            if (mods.tracers) {
                ensureTracer(target);
                applyTracerColor(target);
            }
            if (mods.chams) {
                if (frameNumber - target.lastChamScanFrame >= CHAM_RENDERER_RESCAN_FRAMES) {
                    scanTargetChamRenderers(target);
                }
                else if (target.chamColorKey !== visualColorKey(color)) {
                    for (const entry of target.chamRenderers || [])
                        entry.colorKey = "";
                    applyChamMaterial(target);
                }
            }
            if (mods.showHp) {
                ensureHpLabel(target);
                applyHpLabelColor(target);
            }
        });
        for (const [key, target] of Array.from(visualTargets.entries())) {
            if (activeKeys.has(key))
                continue;
            if (isUnityObjectAlive(target.tracer))
                destroy(target.tracer);
            clearTargetHpLabel(target);
            restoreTargetChams(target);
            visualTargets.delete(key);
        }
    }
    function networkPlayerHeadPosition(player) {
        if (!isUnityObjectAlive(player))
            return null;
        if (isBot(player)) return botAimPosition(player);
        if (ClipboardWeapon) {
            try {
                const value = ClipboardWeapon.method("GetPlayerBodyHeadCenter", 1)
                    .overload("DLARX_NetworkPlayer")
                    .invoke(player);
                const position = vector3Value(value);
                if (position)
                    return position;
            }
            catch (_) { }
        }
        try {
            const avatar = networkPlayerAvatarObject(player);
            const source = isUnityObjectAlive(avatar) ? avatar : componentGameObject(player);
            if (!isUnityObjectAlive(source))
                return null;
            const fallback = transformPosition(getTransform(source));
            if (fallback)
                fallback[1] += 0.85;
            return fallback;
        }
        catch (_) {
            return null;
        }
    }
    function readPlayerRelation(source, target, methodNames) {
        if (!isUnityObjectAlive(source) || !isUnityObjectAlive(target))
            return null;
        for (const methodName of methodNames) {
            try {
                const method = source.method(methodName, 1);
                if (String(method.returnType?.name || "") !== "System.Boolean")
                    continue;
                return !!method.invoke(target);
            }
            catch (_) { }
        }
        return null;
    }
    function activeModeHasNoTeammates() {
        for (const klass of MatchModeClasses) {
            try {
                if (!objectsOfClass(klass).some(componentIsActiveInScene))
                    continue;
                const name = String(klass.fullName || klass.name || "");
                if (/duels?/i.test(name))
                    return true;
            }
            catch (_) { }
        }
        return false;
    }
    function aimbotPlayerIsEnemy(local, target, matchModeActive, noTeammates) {
        if (isBot(target)) return botIsAlive(target);
        if (!isUnityObjectAlive(local) || !isUnityObjectAlive(target) ||
            isLocalNetworkTarget(target, local) || !componentIsActiveInScene(target) ||
            !matchModeActive)
            return false;
        const sameTeamMethods = [
            "IsTeammate", "IsTeamMate", "IsSameTeam", "IsOnSameTeam",
            "IsPlayerInMyTeam", "AreTeammates",
        ];
        const enemyMethods = ["IsEnemy", "IsOpponent", "IsRival", "IsHostile"];
        let sameTeam = readPlayerRelation(local, target, sameTeamMethods);
        if (sameTeam === null)
            sameTeam = readPlayerRelation(target, local, sameTeamMethods);
        if (sameTeam === true)
            return false;
        let enemy = readPlayerRelation(local, target, enemyMethods);
        if (enemy === null)
            enemy = readPlayerRelation(target, local, enemyMethods);
        if (enemy !== null)
            return enemy;
        const localTeam = readTeamId(local);
        const targetTeam = readTeamId(target);
        if (localTeam !== null && targetTeam !== null)
            return localTeam !== targetTeam;
        // Duels have no friendly player slot. In team modes an unknown team is
        // deliberately skipped so Aimbot can never guess and select a teammate.
        return noTeammates;
    }
    function refreshAimbotTarget() {
        if (!mods.aimbot) {
            aimbotTarget = null;
            aimbotTargetPoint = null;
            return null;
        }
        if (frameNumber < aimbotTargetRefreshFrame)
            return isUnityObjectAlive(aimbotTarget) ? aimbotTarget : null;
        aimbotTargetRefreshFrame = frameNumber + AIMBOT_EMPTY_TARGET_REFRESH_FRAMES;
        aimbotTarget = null;
        aimbotTargetPoint = null;
        aimbotTargetPointFrame = -1000;
        const players = objectsOfClass(NetworkPlayer);
        const local = findLocalNetworkPlayer(players);
        let origin = null;
        try {
            if (isUnityObjectAlive(activeLocalPlayer))
                origin = transformPosition(getTransform(activeLocalPlayer));
        }
        catch (_) { }
        if (!origin)
            origin = networkPlayerHeadPosition(local);
        if (!origin)
            return null;
        const matchModeActive = concreteMatchModeIsActive();
        const noTeammates = activeModeHasNoTeammates();
        let nearestDistance = Number.POSITIVE_INFINITY;
        for (const candidate of players.concat(activeBots())) {
            if (!aimbotPlayerIsEnemy(local, candidate, matchModeActive, noTeammates))
                continue;
            const health = readNetworkPlayerHealth(candidate);
            if (Number.isFinite(health) && health <= 0)
                continue;
            const head = networkPlayerHeadPosition(candidate);
            if (!head)
                continue;
            const distance = squaredDistance(origin, head);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                aimbotTarget = candidate;
                aimbotTargetPoint = head;
                aimbotTargetPointFrame = frameNumber;
            }
        }
        if (isUnityObjectAlive(aimbotTarget))
            aimbotTargetRefreshFrame = frameNumber + AIMBOT_TARGET_REFRESH_FRAMES;
        return aimbotTarget;
    }
    function currentAimbotTargetPoint(target) {
        if (!isUnityObjectAlive(target))
            return null;
        if (isBot(target) && !botIsAlive(target)) {
            aimbotTargetRefreshFrame = -1;
            return null;
        }
        if (aimbotTargetPoint &&
            frameNumber < aimbotTargetPointFrame + AIMBOT_TARGET_POINT_REFRESH_FRAMES)
            return aimbotTargetPoint;
        aimbotTargetPoint = networkPlayerHeadPosition(target);
        aimbotTargetPointFrame = frameNumber;
        return aimbotTargetPoint;
    }
    function weaponAimTransform(weapon) {
        const cacheKey = String(visualObjectKey(weapon));
        if (cacheKey) {
            const cached = aimbotAimTransformCache.get(cacheKey);
            if (cached && frameNumber < cached.expires && isUnityObjectAlive(cached.transform))
                return cached.transform;
        }
        let resolved = null;
        for (const fieldName of [
            "muzzleTransform", "MuzzleTransform", "muzzle", "Muzzle",
            "barrelTransform", "BarrelTransform", "barrel", "Barrel",
            "firePoint", "FirePoint", "shootPoint", "ShootPoint",
            "projectileSpawnPoint", "bulletSpawnPoint", "aimTransform",
        ]) {
            const transform = resolveTransformFromField(weapon, fieldName);
            if (isUnityObjectAlive(transform)) {
                resolved = transform;
                break;
            }
        }
        if (!resolved) {
            for (const methodName of [
                "GetMuzzleTransform", "GetMuzzle", "GetBarrelTransform",
                "GetFirePoint", "GetShootPoint", "GetProjectileSpawnPoint",
            ]) {
                try {
                    const value = weapon.method(methodName, 0).invoke();
                    const object = hierarchyGameObject(value);
                    const transform = isUnityObjectAlive(object) ? getTransform(object) : value;
                    if (isUnityObjectAlive(transform)) {
                        resolved = transform;
                        break;
                    }
                }
                catch (_) { }
            }
        }
        if (!resolved) {
            try {
                resolved = getTransform(weapon);
            }
            catch (_) { }
        }
        if (cacheKey && isUnityObjectAlive(resolved)) {
            aimbotAimTransformCache.set(cacheKey, {
                transform: resolved,
                expires: frameNumber + AIMBOT_AIM_TRANSFORM_RECHECK_FRAMES,
            });
        }
        return isUnityObjectAlive(resolved) ? resolved : null;
    }
    function aimbotDirectionForWeapon(weapon, targetPoint = null) {
        if (!mods.aimbot || !isGun(weapon))
            return null;
        const target = refreshAimbotTarget();
        if (!isUnityObjectAlive(target))
            return null;
        const destination = targetPoint || currentAimbotTargetPoint(target);
        if (!destination)
            return null;
        try {
            const root = getTransform(weapon);
            const aim = weaponAimTransform(weapon);
            const origin = transformPosition(aim);
            if (!isUnityObjectAlive(root) || !isUnityObjectAlive(aim) || !origin)
                return null;
            const direction = [
                destination[0] - origin[0],
                destination[1] - origin[1],
                destination[2] - origin[2],
            ];
            const magnitudeSquared = direction[0] * direction[0] +
                direction[1] * direction[1] + direction[2] * direction[2];
            if (!Number.isFinite(magnitudeSquared) || magnitudeSquared < 0.000001)
                return null;
            const inverseMagnitude = 1.0 / Math.sqrt(magnitudeSquared);
            direction[0] *= inverseMagnitude;
            direction[1] *= inverseMagnitude;
            direction[2] *= inverseMagnitude;
            return { root, aim, direction };
        }
        catch (_) {
            return null;
        }
    }
    function applyAimbotSolution(solution) {
        if (!solution)
            return false;
        try {
            let rotation = null;
            try {
                const currentForward = solution.aim.method("get_forward", 0).invoke();
                const delta = Quaternion.method("FromToRotation", 2)
                    .invoke(currentForward, solution.direction);
                const current = solution.root.method("get_rotation", 0).invoke();
                rotation = Quaternion.method("op_Multiply", 2).invoke(delta, current);
            }
            catch (_) {
                rotation = Quaternion.method("LookRotation", 1).invoke(solution.direction);
            }
            solution.root.method("set_rotation", 1).invoke(rotation);
            return true;
        }
        catch (_) {
            return false;
        }
    }
    function applyAimbotToWeapon(weapon, targetPoint = null) {
        return applyAimbotSolution(aimbotDirectionForWeapon(weapon, targetPoint));
    }
    function updateAimbot() {
        if (!mods.aimbot) {
            aimbotTarget = null;
            aimbotTargetPoint = null;
            return;
        }
        if (frameNumber < aimbotVisualRefreshFrame)
            return;
        aimbotVisualRefreshFrame = frameNumber + AIMBOT_VISUAL_REFRESH_FRAMES;
        const target = refreshAimbotTarget();
        const destination = currentAimbotTargetPoint(target);
        if (!destination)
            return;
        for (const weapon of getLocalHeldWeapons())
            applyAimbotToWeapon(weapon, destination);
    }
    function updateTracerPositions(player) {
        // handRightAnchor is the exact local muzzle/hand-space origin in this build.
        const originTransform = getRightHandTransform(player);
        const origin = transformPosition(originTransform);
        if (!origin)
            return;
        for (const target of visualTargets.values()) {
            if (!isUnityObjectAlive(target.player) || !isUnityObjectAlive(target.tracerRenderer))
                continue;
            const destination = networkPlayerHeadPosition(target.player);
            if (!destination)
                continue;
            try {
                target.tracerRenderer.method("SetPosition", 2).invoke(0, origin);
                target.tracerRenderer.method("SetPosition", 2).invoke(1, destination);
            }
            catch (_) { }
        }
    }
    function updateVisuals(player) {
        if (!mods.tracers)
            clearTracers();
        if (!mods.chams)
            restoreChams();
        if (!mods.showHp)
            clearHpLabels();
        if (!mods.showHitboxes)
            clearHitboxVisuals();
        const targetVisualsEnabled = mods.tracers || mods.chams || mods.showHp;
        if (!targetVisualsEnabled && visualTargets.size > 0) {
            visualTargets.clear();
            lastVisualScanFrame = -1000;
        }
        if (!mods.tracers && !mods.chams && !mods.showHp && !mods.showHitboxes) {
            if (visualTargets.size > 0 || isLive(visualRoot))
                clearVisuals();
            return;
        }
        if (targetVisualsEnabled && frameNumber - lastVisualScanFrame >= VISUAL_SCAN_INTERVAL_FRAMES) {
            lastVisualScanFrame = frameNumber;
            scanVisualTargets();
        }
        if (mods.tracers && frameNumber % 3 === 0)
            updateTracerPositions(player);
        if (mods.showHp && frameNumber % HP_POSITION_REFRESH_FRAMES === 0)
            updateHpLabels();
        updateHitboxVisuals();
    }
    function selectedSpawnPrefabEntry() {
        if (spawnPrefabCatalog.length === 0)
            return { name: "Scanning...", kind: "local", prefab: null, networkObject: null };
        selectedSpawnPrefabIndex = ((selectedSpawnPrefabIndex % spawnPrefabCatalog.length) +
            spawnPrefabCatalog.length) % spawnPrefabCatalog.length;
        return spawnPrefabCatalog[selectedSpawnPrefabIndex];
    }
    function selectSpawnPrefab(index) {
        if (!Number.isInteger(index) || index < 0 || index >= spawnPrefabCatalog.length)
            return;
        selectedSpawnPrefabIndex = index;
        const selected = selectedSpawnPrefabEntry();
        vfxGunFailureCount = 0;
        vfxGunDispatchUnavailableUntil = -1000.0;
        console.log("[" + MENU_NAME + "] Selected spawn prefab #" + index + ": " +
            selected.name + " [" + selected.kind + "]");
    }
    function gameObjectIsPrefabAsset(object) {
        if (!isUnityObjectAlive(object))
            return false;
        try {
            const scene = object.method("get_scene", 0).invoke();
            if (!(scene instanceof Il2Cpp.ValueType) || scene.method("IsValid", 0).invoke())
                return false;
        }
        catch (_) {
            return false;
        }
        try {
            const parent = getTransform(object).method("get_parent", 0).invoke();
            if (isUnityObjectAlive(parent))
                return false;
        }
        catch (_) { }
        return true;
    }
    function spawnPrefabAssetRoot(object) {
        if (!isUnityObjectAlive(object))
            return null;
        let currentObject = object;
        try {
            let transform = getTransform(currentObject);
            for (let depth = 0; depth < 32; depth++) {
                const parent = transform.method("get_parent", 0).invoke();
                if (!isUnityObjectAlive(parent))
                    break;
                const parentObject = parent.method("get_gameObject", 0).invoke();
                if (!isUnityObjectAlive(parentObject))
                    break;
                currentObject = parentObject;
                transform = parent;
            }
        }
        catch (_) { }
        return currentObject;
    }
    function spawnPrefabNetworkObject(prefab) {
        if (!FusionNetworkObject || !isUnityObjectAlive(prefab))
            return null;
        let networkObject = getComponent(prefab, FusionNetworkObject);
        if (isUnityObjectAlive(networkObject))
            return networkObject;
        try {
            networkObject = prefab.method("GetComponentInChildren", 2)
                .overload("System.Type", "System.Boolean")
                .invoke(FusionNetworkObject.type.object, true);
        }
        catch (_) { }
        return isUnityObjectAlive(networkObject) ? networkObject : null;
    }
    function spawnPrefabNetworkId(networkObject) {
        if (!FusionNetworkObject || !isUnityObjectAlive(networkObject))
            return null;
        try {
            const typeId = networkObject.field("NetworkTypeId").value;
            if (!(typeId instanceof Il2Cpp.ValueType) ||
                !typeId.method("get_IsValid", 0).invoke() ||
                !typeId.method("get_IsPrefab", 0).invoke())
                return null;
            const text = typeId.toString();
            const match = String(text).match(/\[Prefab\s+(\d+)\]/i);
            return match ? Number(match[1]) : String(text);
        }
        catch (_) {
            return null;
        }
    }
    function dumpSpawnPrefabCatalog() {
        spawnPrefabCatalogGeneration++;
        const lines = spawnPrefabCatalog.map((entry, index) => {
            const networkDetail = entry.networkId === null || entry.networkId === undefined
                ? "" : " PrefabId=" + entry.networkId;
            return "  [" + index + "] [" + entry.kind.toUpperCase() + "] " +
                entry.name + networkDetail;
        });
        console.log("[" + MENU_NAME + "] Spawnable prefab dump #" +
            spawnPrefabCatalogGeneration + " (" + spawnPrefabCatalog.length + " entries):\n" +
            (lines.length > 0 ? lines.join("\n") : "  <none loaded>"));
    }
    function ensureSpawnPrefabCatalog(force = false) {
        if (spawnPrefabCatalogResolved && !force)
            return;
        const now = unityNow();
        if (!force && now < spawnPrefabCatalogNextResolveAt)
            return;
        spawnPrefabCatalogNextResolveAt = now + 5.0;
        const previous = spawnPrefabCatalog.length > 0
            ? selectedSpawnPrefabEntry().name : "";
        try {
            const discovered = [];
            const seenHandles = new Set();
            const candidates = [];
            const appendCandidates = (klass) => {
                if (!klass)
                    return;
                for (const value of objectArrayValues(findResourceObjects(klass))) {
                    try {
                        const object = GameObject.isAssignableFrom(value.class)
                            ? value : componentGameObject(value);
                        const root = spawnPrefabAssetRoot(object);
                        if (isUnityObjectAlive(root))
                            candidates.push(root);
                    }
                    catch (_) { }
                }
            };
            // These component families cover Fusion-spawnable prefabs plus the
            // loaded physical/projectile prefab assets without walking Unity's
            // enormous all-GameObject resource table.
            appendCandidates(FusionNetworkObject);
            appendCandidates(Rigidbody);
            appendCandidates(ProjectileWeapon);
            appendCandidates(GrenadeProjectile);
            for (const prefab of candidates) {
                let handle = "";
                try {
                    handle = String(prefab.handle);
                }
                catch (_) { }
                if (handle && seenHandles.has(handle))
                    continue;
                if (handle)
                    seenHandles.add(handle);
                if (!gameObjectIsPrefabAsset(prefab))
                    continue;
                const name = objectName(prefab).trim();
                if (!name || /^AnimalRivals(?:Rasp|Vfx|Spawn)/i.test(name))
                    continue;
                const networkObject = spawnPrefabNetworkObject(prefab);
                const networkId = spawnPrefabNetworkId(networkObject);
                discovered.push({
                    name,
                    prefab,
                    networkObject: networkId === null ? null : networkObject,
                    networkId,
                    kind: networkId === null ? "local" : "network",
                });
            }
            discovered.sort((left, right) => {
                if (left.kind !== right.kind)
                    return left.kind === "network" ? -1 : 1;
                return left.name.localeCompare(right.name, undefined, { sensitivity: "base" });
            });
            const totals = new Map();
            for (const entry of discovered)
                totals.set(entry.name, (totals.get(entry.name) || 0) + 1);
            const occurrences = new Map();
            for (const entry of discovered) {
                if ((totals.get(entry.name) || 0) <= 1)
                    continue;
                const occurrence = (occurrences.get(entry.name) || 0) + 1;
                occurrences.set(entry.name, occurrence);
                entry.name += " #" + occurrence;
            }
            spawnPrefabCatalog = discovered;
            selectedSpawnPrefabIndex = Math.max(0,
                discovered.findIndex(entry => entry.name === previous));
            spawnPrefabCatalogResolved = true;
            dumpSpawnPrefabCatalog();
        }
        catch (error) {
            spawnPrefabCatalogResolved = false;
            if (now >= vfxGunNextErrorLogAt) {
                vfxGunNextErrorLogAt = now + 8.0;
                console.error("[" + MENU_NAME + "] Prefab discovery deferred: " + error);
            }
        }
    }
    function refreshSpawnPrefabCatalog() {
        spawnPrefabCatalogResolved = false;
        spawnPrefabCatalogNextResolveAt = -1000.0;
        ensureSpawnPrefabCatalog(true);
    }
    function selectedVfxEntry() {
        if (vfxCatalog.length === 0)
            return { id: 0, name: "VFX ID 0" };
        selectedVfxCatalogIndex = ((selectedVfxCatalogIndex % vfxCatalog.length) + vfxCatalog.length) % vfxCatalog.length;
        return vfxCatalog[selectedVfxCatalogIndex];
    }
    function cycleSelectedVfx(delta) {
        if (vfxCatalog.length === 0)
            return;
        selectedVfxCatalogIndex = ((selectedVfxCatalogIndex + delta) % vfxCatalog.length + vfxCatalog.length) % vfxCatalog.length;
        vfxGunFailureCount = 0;
        vfxGunDispatchUnavailableUntil = -1000.0;
        vfxGunNextShotAt = unityNow();
        const selected = selectedVfxEntry();
        console.log("[" + MENU_NAME + "] Selected VFX: " + selected.name + " [" + selected.id + "]" +
            (rightGrip ? " (previous)" : " (next)"));
    }
    function vfxCollectionCount(value) {
        if (!value)
            return 0;
        try {
            const length = Number(value.length);
            if (Number.isFinite(length))
                return Math.max(0, Math.min(VFX_ID_MAX_COUNT, Math.trunc(length)));
        }
        catch (_) { }
        try {
            const count = Number(value.method("get_Count", 0).invoke());
            if (Number.isFinite(count))
                return Math.max(0, Math.min(VFX_ID_MAX_COUNT, Math.trunc(count)));
        }
        catch (_) { }
        try {
            const count = Number(value.method("get_Count", 1).invoke());
            if (Number.isFinite(count))
                return Math.max(0, Math.min(VFX_ID_MAX_COUNT, Math.trunc(count)));
        }
        catch (_) { }
        try {
            const count = Number(value.method("GetCount", 0).invoke());
            if (Number.isFinite(count))
                return Math.max(0, Math.min(VFX_ID_MAX_COUNT, Math.trunc(count)));
        }
        catch (_) { }
        return 0;
    }
    function vfxCollectionItem(value, index) {
        return vfxCollectionTryGet(value, index);
    }
    function vfxCollectionTryGet(value, key) {
        try {
            if (Array.isArray(value) && typeof key === "number")
                return value[key] ?? null;
        }
        catch (_) { }
        try {
            return value.get(key);
        }
        catch (_) { }
        try {
            return value.get_Item(key);
        }
        catch (_) { }
        try {
            return value.method("get_Item", 1).invoke(key);
        }
        catch (_) { }
        try {
            return value.method("Get", 1).invoke(key);
        }
        catch (_) { }
        return null;
    }
    function vfxNumericValue(value) {
        const numeric = numericValue(value);
        return Number.isFinite(numeric) ? numeric : null;
    }
    function vfxReadFieldValue(scope, fieldName) {
        try {
            if (scope === null || scope === undefined)
                return null;
            return scope.field(fieldName).value;
        }
        catch (_) {
            return null;
        }
    }
    function vfxReadIdCandidateFromValue(value) {
        if (value === null || value === undefined)
            return null;
        if (typeof value === "number" || typeof value === "bigint")
            return Math.round(vfxNumericValue(value) ?? 0);
        if (typeof value === "string") {
            const parsed = vfxNumericValue(Number(value));
            if (Number.isFinite(parsed))
                return Math.round(parsed);
        }
        const idCandidates = [
            "id",
            "Id",
            "ID",
            "index",
            "Index",
            "key",
            "Key",
            "m_Key",
            "Item1",
            "item1",
            "m_Item1",
            "worldVfxId",
            "vfxId",
            "VfxId",
            "worldVFXId",
            "WorldVFXId",
            "vfxID",
            "VFXID",
        ];
        for (const fieldName of idCandidates) {
            try {
                const valueCandidate = vfxReadFieldValue(value, fieldName);
                const numeric = vfxNumericValue(valueCandidate);
                if (Number.isFinite(numeric))
                    return Math.round(numeric);
            }
            catch (_) { }
        }
        try {
            const methodCandidates = [
                "GetId",
                "get_Id",
                "GetIndex",
                "get_Index",
                "GetKey",
                "get_Key",
                "get_id",
                "get_index",
                "GetVfxId",
                "GetWorldVfxId",
            ];
            for (const methodName of methodCandidates) {
                try {
                    const method = value.method(methodName, 0);
                    const numeric = vfxNumericValue(method.invoke());
                    if (Number.isFinite(numeric))
                        return Math.round(numeric);
                }
                catch (_) { }
            }
        }
        catch (_) { }
        return null;
    }
    function vfxResolvedId(value, fallback) {
        const idValue = vfxReadIdCandidateFromValue(value);
        if (idValue !== null)
            return idValue;
        const fallbackValue = vfxNumericValue(fallback);
        return Number.isFinite(fallbackValue) ? Math.round(fallbackValue) : 0;
    }
    function vfxPrefabCandidateFromValue(value) {
        if (value === null || value === undefined)
            return null;
        if (typeof value !== "object")
            return value;
        const candidates = [
            "value",
            "Value",
            "m_Value",
            "Item2",
            "item2",
            "m_Item2",
            "prefab",
            "Prefab",
            "vfxPrefab",
            "vfx",
            "Vfx",
            "VfxPrefab",
            "gameObject",
            "GameObject",
            "entry",
            "Entry",
            "payload",
            "Payload",
        ];
        for (const fieldName of candidates) {
            try {
                const nested = vfxReadFieldValue(value, fieldName);
                if (nested !== null && nested !== undefined)
                    return nested;
            }
            catch (_) { }
        }
        return value;
    }
    function vfxEnumerableValues(value) {
        const discovered = [];
        const pushUnique = (entry) => {
            if (entry === null || entry === undefined)
                return;
            if (discovered.some(existing => existing === entry || sameObject(existing, entry)))
                return;
            discovered.push(entry);
        };
        if (value === null || value === undefined)
            return discovered;
        const count = vfxCollectionCount(value);
        for (let index = 0; index < count; index++)
            pushUnique(vfxCollectionItem(value, index));
        if (discovered.length > 0)
            return discovered;
        try {
            const enumerator = value.method("GetEnumerator", 0).invoke();
            for (let index = 0; index < VFX_ID_MAX_COUNT; index++) {
                if (!enumerator.method("MoveNext", 0).invoke())
                    break;
                pushUnique(enumerator.method("get_Current", 0).invoke());
            }
        }
        catch (_) { }
        return discovered;
    }
    function vfxCollectionKeys(value) {
        if (value === null || value === undefined)
            return [];
        const candidates = [];
        for (const fieldName of ["Keys", "keys"]) {
            try {
                candidates.push(value.field(fieldName).value);
            }
            catch (_) { }
        }
        try {
            candidates.push(value.method("get_Keys", 0).invoke());
        }
        catch (_) { }
        for (const candidate of candidates) {
            const keys = vfxEnumerableValues(candidate);
            if (keys.length > 0)
                return keys;
        }
        return [];
    }
    function resolveVfxNameResolver(player) {
        if (vfxNameResolver && unityNow() - vfxNameResolverLastScan < 6.0)
            return vfxNameResolver;
        vfxNameResolverLastScan = unityNow();
        vfxNameResolver = null;
        if (!NetworkPlayer || !isUnityObjectAlive(player))
            return null;
        const candidates = [
            "GetVfxName",
            "GetVfxIdName",
            "GetWorldVFXName",
            "GetWorldVfxName",
            "GetWorldVisualEffectName",
            "GetEffectName",
        ];
        for (const name of candidates) {
            try {
                const method = player.method(name, 1);
                if (method.parameterCount !== 1 || method.returnType.name !== "System.String" ||
                    method.virtualAddress.isNull() || method.isGeneric || method.isInflated)
                    continue;
                vfxNameResolver = { type: "method", method };
                return vfxNameResolver;
            }
            catch (_) { }
        }
        try {
            for (const method of player.class.methods || []) {
                const name = String(method.name || "");
                if (method.parameterCount !== 1 || method.returnType.name !== "System.String" || method.virtualAddress.isNull())
                    continue;
                if (!/(world.*name|vfx.*name|effect.*name|visual.*name)/i.test(name))
                    continue;
                if (/(name|label|title)/i.test(name)) {
                    vfxNameResolver = { type: "method", method };
                    break;
                }
            }
        }
        catch (_) { }
        return vfxNameResolver;
    }
    function resolveVfxNameFromMethod(player, id) {
        try {
            const resolver = resolveVfxNameResolver(player);
            if (!resolver || resolver.type !== "method")
                return null;
            const method = resolver.method;
            const invokeTarget = method.isStatic ? null : player;
            if (method.parameterCount === 0) {
                return method.invoke(invokeTarget);
            }
            return method.invokeRaw(invokeTarget, id);
        }
        catch (_) {
            return null;
        }
    }
    function vfxStringValue(value) {
        if (value === null || value === undefined)
            return "";
        if (typeof value === "string")
            return value.trim();
        try {
            if (typeof value.content === "string")
                return value.content.trim();
        }
        catch (_) { }
        try {
            const text = String(value).trim();
            if (text && text !== "[object Object]" && !/^0x[0-9a-f]+$/i.test(text))
                return text;
        }
        catch (_) { }
        return "";
    }
    function vfxDisplayName(value, id) {
        const name = vfxStringValue(value);
        if (!name || /^[+-]?\d+(?:\.\d+)?$/.test(name))
            return "";
        const normalized = name.toLowerCase();
        if (normalized === ("id " + id).toLowerCase() ||
            normalized === ("vfx id " + id).toLowerCase() ||
            normalized.endsWith("#" + id))
            return "";
        return name;
    }
    function vfxPrefabName(player, value, id) {
        // Prefer explicit display metadata on collection entries. Numeric IDs
        // are intentionally not accepted as names.
        for (const fieldName of ["name", "Name", "label", "Label", "title", "Title"]) {
            try {
                const nested = value.field(fieldName).value;
                const display = vfxDisplayName(objectName(nested) || nested, id);
                if (display)
                    return display;
            }
            catch (_) { }
        }
        const initialCandidate = value ? vfxPrefabCandidateFromValue(value) : null;
        let name = vfxDisplayName(initialCandidate ? objectName(initialCandidate) : "", id);
        if (!name && (typeof initialCandidate === "string" ||
            typeof initialCandidate?.content === "string")) {
            name = vfxDisplayName(initialCandidate, id);
        }
        if (name)
            return name;
        if (isUnityObjectAlive(player)) {
            const resolved = resolveVfxNameFromMethod(player, id);
            const resolvedName = vfxDisplayName(resolved, id);
            if (resolvedName)
                return resolvedName;
        }
        const fields = [
            "prefab",
            "Prefab",
            "gameObject",
            "GameObject",
            "vfxPrefab",
            "VfxPrefab",
        ];
        for (const fieldName of fields) {
            try {
                const nested = value.field(fieldName).value;
                name = vfxDisplayName(objectName(nested) || nested, id);
                if (name)
                    return name;
            }
            catch (_) { }
        }
        for (const methodName of ["GetPrefab", "get_Prefab", "GetVFX", "get_vfx", "GetVfx", "ToString"]) {
            try {
                const method = vfxPrefabCandidateFromValue(value).method(methodName, 0);
                const nested = method.invoke();
                name = vfxDisplayName(objectName(nested) || nested, id);
                if (name)
                    return name;
            }
            catch (_) { }
        }
        const candidate = vfxPrefabCandidateFromValue(value);
        if (candidate && candidate.class && candidate.class.name)
            return String(candidate.class.name) + "#" + id;
        return "ID " + id;
    }
    function vfxCatalogFromCollection(player, collection) {
        const count = vfxCollectionCount(collection);
        if (count <= 0)
            return [];
        const discovered = [];
        const seenIds = new Set();
        const append = (rawKey, fallbackIndex, dictionaryEntry) => {
            const rawValue = vfxCollectionItem(collection, rawKey);
            if (rawValue === null || rawValue === undefined)
                return;
            const discoveredId = dictionaryEntry
                ? vfxResolvedId(rawKey, fallbackIndex)
                : vfxResolvedId(rawValue, fallbackIndex);
            if (!Number.isFinite(discoveredId) || seenIds.has(discoveredId))
                return;
            seenIds.add(discoveredId);
            discovered.push({
                id: discoveredId,
                name: vfxPrefabName(player, rawValue, discoveredId),
            });
        };
        const keys = vfxCollectionKeys(collection);
        if (keys.length > 0) {
            keys.forEach((rawKey, index) => append(rawKey, index, true));
        }
        else {
            for (let index = 0; index < count; index++)
                append(index, index, false);
        }
        discovered.sort((left, right) => left.id - right.id);
        return discovered;
    }
    function vfxCatalogHasRealNames(entries) {
        if (!Array.isArray(entries) || entries.length === 0)
            return false;
        const resolvedCount = entries.filter(entry => !!vfxDisplayName(entry.name, entry.id)).length;
        const requiredCount = entries.length === 1
            ? 1
            : Math.max(2, Math.ceil(entries.length * 0.6));
        return resolvedCount >= requiredCount;
    }
    function vfxMethodIsCollectionGetter(method) {
        try {
            const name = String(method.name || "");
            const returnName = String(method.returnType?.name || "");
            return method.parameterCount === 0 && !method.virtualAddress.isNull() &&
                !method.isGeneric && !method.isInflated &&
                /^(get_|Get|Find|Enumerate|List)/.test(name) &&
                /vfx|visual.?effect|world.?fx|prefab/i.test(name) &&
                returnName !== "System.Void" &&
                /\[\]|List|Dictionary|Enumerable|Collection|Array/i.test(returnName);
        }
        catch (_) {
            return false;
        }
    }
    function resolveVfxCatalogFromManager(player) {
        if (!VfxsManager)
            return null;
        const managers = objectsOfClass(VfxsManager, true, true);
        const fields = Array.from(VfxsManager.fields || [])
            .filter((field) => /vfx|visual.?effect|world.?fx|prefab/i.test(String(field.name)))
            .sort((left, right) => {
            const score = (field) => {
                const name = String(field.name || "");
                const type = String(field.type?.name || "");
                return (/world.*vfx|vfx.*prefab/i.test(name) ? 20 : 0) +
                    (/prefab/i.test(name) ? 10 : 0) +
                    (/\[\]|List|Dictionary|Array/i.test(type) ? 5 : 0);
            };
            return score(right) - score(left);
        });
        const instanceSources = managers.length > 0 ? managers : [null];
        for (const manager of instanceSources) {
            for (const field of fields) {
                if (!field.isStatic && !isUnityObjectAlive(manager))
                    continue;
                let collection = null;
                try {
                    collection = field.isStatic
                        ? field.value
                        : manager.field(String(field.name)).value;
                }
                catch (_) {
                    continue;
                }
                const entries = vfxCatalogFromCollection(player, collection);
                if (vfxCatalogHasRealNames(entries))
                    return { entries, source: "VfxsManager." + String(field.name) };
            }
        }
        for (const manager of instanceSources) {
            for (const method of VfxsManager.methods || []) {
                if (!vfxMethodIsCollectionGetter(method))
                    continue;
                if (!method.isStatic && !isUnityObjectAlive(manager))
                    continue;
                let collection = null;
                try {
                    collection = method.isStatic ? method.invoke() : method.invoke(manager);
                }
                catch (_) {
                    continue;
                }
                const entries = vfxCatalogFromCollection(player, collection);
                if (vfxCatalogHasRealNames(entries))
                    return { entries, source: "VfxsManager." + String(method.name) + "()" };
            }
        }
        return null;
    }
    function ensureVfxCatalog(player) {
        if (vfxCatalogResolved || !NetworkPlayer || !isUnityObjectAlive(player))
            return;
        const now = unityNow();
        if (now < vfxCatalogNextResolveAt)
            return;
        // Retry only occasionally because some lobby player objects do not yet
        // have their serialized world-VFX array populated.
        vfxCatalogNextResolveAt = now + 10.0;
        try {
            const managerCatalog = resolveVfxCatalogFromManager(player);
            if (managerCatalog) {
                const selectedId = selectedVfxEntry().id;
                vfxCatalog = managerCatalog.entries;
                selectedVfxCatalogIndex = Math.max(0, vfxCatalog.findIndex(entry => entry.id === selectedId));
                vfxCatalogResolved = true;
                console.log("[" + MENU_NAME + "] VFX selector mapped " + vfxCatalog.length +
                    " real prefab IDs from " + managerCatalog.source + ".");
                return;
            }
            const candidates = Array.from(NetworkPlayer.fields)
                .filter((field) => /vfx|visual.?effect|world.?fx/i.test(String(field.name)))
                .sort((left, right) => {
                const score = (field) => {
                    const name = String(field.name);
                    const type = String(field.type?.name ?? "");
                    return (/world.*vfx|vfx.*prefab/i.test(name) ? 20 : 0) +
                        (/prefab/i.test(name) ? 10 : 0) +
                        (/\[\]|List|Array/i.test(type) ? 5 : 0);
                };
                    return score(right) - score(left);
                });
            for (const field of candidates) {
                let collection = null;
                try {
                    collection = field.isStatic
                        ? field.value
                        : player.field(String(field.name)).value;
                }
                catch (_) {
                    continue;
                }
                const discovered = vfxCatalogFromCollection(player, collection);
                if (!vfxCatalogHasRealNames(discovered))
                    continue;
                const selectedId = selectedVfxEntry().id;
                vfxCatalog = discovered;
                selectedVfxCatalogIndex = Math.max(0, discovered.findIndex(entry => entry.id === selectedId));
                vfxCatalogResolved = true;
                console.log("[" + MENU_NAME + "] VFX selector mapped " + discovered.length +
                    " IDs from DLARX_NetworkPlayer." + String(field.name) + ".");
                return;
            }
            const methods = (NetworkPlayer.methods || [])
                .filter(vfxMethodIsCollectionGetter)
                .sort((left, right) => String(right.name).length - String(left.name).length);
            for (const method of methods) {
                let collection = null;
                try {
                    collection = method.isStatic
                        ? method.invoke()
                        : method.invoke(player);
                }
                catch (_) { }
                const discovered = vfxCatalogFromCollection(player, collection);
                if (!vfxCatalogHasRealNames(discovered))
                    continue;
                if (discovered.length > 0) {
                    const selectedId = selectedVfxEntry().id;
                    vfxCatalog = discovered;
                    selectedVfxCatalogIndex = Math.max(0, discovered.findIndex(entry => entry.id === selectedId));
                    vfxCatalogResolved = true;
                    console.log("[" + MENU_NAME + "] VFX selector mapped " + discovered.length +
                        " IDs from DLARX_NetworkPlayer." + String(method.name) + "().");
                    return;
                }
            }
        }
        catch (error) {
            if (now >= vfxGunNextErrorLogAt) {
                vfxGunNextErrorLogAt = now + 10.0;
                console.error("[" + MENU_NAME + "] VFX catalog discovery deferred: " + error);
            }
        }
    }
    function getVfxNetworkPlayer() {
        if (isUnityObjectAlive(vfxGunRpcPlayer))
            return vfxGunRpcPlayer;
        const now = unityNow();
        if (now < vfxGunNextPlayerLookupAt || !NetworkPlayer)
            return null;
        vfxGunNextPlayerLookupAt = now + 2.0;
        try {
            const local = findLocalNetworkPlayer(objectsOfClass(NetworkPlayer));
            if (isUnityObjectAlive(local)) {
                vfxGunRpcPlayer = local;
                vfxGunBoundRpc = null;
                return local;
            }
        }
        catch (_) { }
        return null;
    }
    function bindVfxGunRpc(player) {
        if (!isUnityObjectAlive(player))
            return null;
        if (vfxGunBoundRpc && sameObject(player, vfxGunRpcPlayer))
            return vfxGunBoundRpc;
        vfxGunBoundRpc = null;
        vfxGunRpcPlayer = player;
        try {
            vfxGunBoundRpc = player.method("RPC_PlayWorldVFXProxy", 3).overload("System.Int32", "UnityEngine.Vector3", "UnityEngine.Quaternion");
        }
        catch (_) {
            try {
                vfxGunBoundRpc = player.method("RPC_PlayWorldVFXProxy", 3);
            }
            catch (_) { }
        }
        return vfxGunBoundRpc;
    }
    function destroyVfxGunVisuals() {
        const rootWasAlive = isUnityObjectAlive(vfxGunRoot);
        if (rootWasAlive)
            destroy(vfxGunRoot);
        if (!rootWasAlive && isUnityObjectAlive(vfxGunTip))
            destroy(vfxGunTip);
        if (!rootWasAlive && isUnityObjectAlive(vfxGunLine)) {
            try {
                destroy(vfxGunLine.method("get_gameObject", 0).invoke());
            }
            catch (_) { }
        }
        if (isUnityObjectAlive(vfxGunMaterial))
            destroy(vfxGunMaterial);
        vfxGunRoot = null;
        vfxGunLine = null;
        vfxGunTip = null;
        vfxGunMaterial = null;
        vfxGunLastStartPosition = null;
        vfxGunLastEndPosition = null;
    }
    function resetVfxGunSceneState() {
        destroyVfxGunVisuals();
        vfxGunBoundRpc = null;
        vfxGunRpcPlayer = null;
        vfxGunNextPlayerLookupAt = -1000.0;
        vfxGunVisualRetryAt = -1000.0;
        vfxGunNextShotAt = -1000.0;
        vfxGunDispatchUnavailableUntil = -1000.0;
        vfxGunFailureCount = 0;
        const selectedId = selectedVfxEntry().id;
        vfxCatalog = Array.from({ length: VFX_ID_FALLBACK_COUNT }, (_, id) => ({ id, name: "VFX ID " + id }));
        selectedVfxCatalogIndex = Math.max(0, Math.min(VFX_ID_FALLBACK_COUNT - 1, selectedId));
        vfxCatalogResolved = false;
        vfxCatalogNextResolveAt = -1000.0;
        vfxNameResolver = null;
        vfxNameResolverLastScan = -1000.0;
        vfxGunRaycast = null;
        vfxGunRaycastMode = "";
        vfxGunRaycastReady = false;
        spawnGunTriggerWasPressed = false;
        spawnGunLocalObjects = [];
        spawnPrefabCatalog = [];
        selectedSpawnPrefabIndex = 0;
        spawnPrefabCatalogResolved = false;
        spawnPrefabCatalogNextResolveAt = -1000.0;
    }
    function ensureVfxGunVisuals() {
        if (isUnityObjectAlive(vfxGunRoot) && isUnityObjectAlive(vfxGunLine) &&
            isUnityObjectAlive(vfxGunTip) && isUnityObjectAlive(vfxGunMaterial))
            return true;
        const now = unityNow();
        if (now < vfxGunVisualRetryAt)
            return false;
        destroyVfxGunVisuals();
        try {
            const shader = getVisualShader();
            if (!isUnityObjectAlive(shader))
                throw new Error("no unlit shader");
            vfxGunMaterial = Material.alloc();
            vfxGunMaterial.method(".ctor", 1)
                .overload("UnityEngine.Shader")
                .invoke(shader);
            configureThroughWallMaterial(vfxGunMaterial, [0.50, 0.0, 0.05, 1.0]);
            vfxGunRoot = createEmpty("AnimalRivalsSpawnGunPointer");
            const rootTransform = getTransform(vfxGunRoot);
            const lineObject = createEmpty("AnimalRivalsSpawnGunCoil");
            getTransform(lineObject).method("SetParent", 2).invoke(rootTransform, false);
            vfxGunLine = addComponent(lineObject, LineRenderer);
            vfxGunLine.method("set_useWorldSpace", 1).invoke(true);
            vfxGunLine.method("set_positionCount", 1).invoke(SPAWN_GUN_COIL_POINTS);
            vfxGunLine.method("set_startWidth", 1).invoke(VFX_GUN_LINE_START_WIDTH);
            vfxGunLine.method("set_endWidth", 1).invoke(VFX_GUN_LINE_END_WIDTH);
            try {
                vfxGunLine.method("set_numCornerVertices", 1).invoke(2);
            }
            catch (_) { }
            try {
                vfxGunLine.method("set_numCapVertices", 1).invoke(2);
            }
            catch (_) { }
            try {
                vfxGunLine.method("set_sharedMaterial", 1).invoke(vfxGunMaterial);
            }
            catch (_) {
                vfxGunLine.method("set_material", 1).invoke(vfxGunMaterial);
            }
            vfxGunTip = GameObject.method("CreatePrimitive", 1).invoke(0);
            setName(vfxGunTip, "AnimalRivalsSpawnGunTip");
            const tipTransform = getTransform(vfxGunTip);
            tipTransform.method("SetParent", 2).invoke(rootTransform, false);
            tipTransform.method("set_localScale", 1).invoke([VFX_GUN_TIP_SCALE, VFX_GUN_TIP_SCALE, VFX_GUN_TIP_SCALE]);
            try {
                vfxGunTip.method("set_layer", 1).invoke(2);
            }
            catch (_) { }
            const tipCollider = getComponent(vfxGunTip, Collider);
            if (isLive(tipCollider))
                destroy(tipCollider);
            const tipRenderer = getComponent(vfxGunTip, Renderer);
            try {
                tipRenderer.method("set_sharedMaterial", 1).invoke(vfxGunMaterial);
            }
            catch (_) {
                tipRenderer.method("set_material", 1).invoke(vfxGunMaterial);
            }
            return true;
        }
        catch (error) {
            destroyVfxGunVisuals();
            vfxGunVisualRetryAt = now + 2.0;
            if (now >= vfxGunNextErrorLogAt) {
                vfxGunNextErrorLogAt = now + 10.0;
                console.error("[" + MENU_NAME + "] VFX pointer creation deferred: " + error);
            }
            return false;
        }
    }
    function raycastHitToGameObject(hitRef) {
        if (!isUnityObjectAlive(hitRef))
            return null;
        const chains = [
            ["get_collider", "get_gameObject"],
            ["get_transform", "get_gameObject"],
            ["get_collider"],
            ["get_transform"],
            ["get_rigidbody", "get_gameObject"],
        ];
        for (const chain of chains) {
            try {
                let value = hitRef;
                for (const methodName of chain) {
                    value = value.method(methodName, 0).invoke();
                }
                if (isUnityObjectAlive(value))
                    return value;
            }
            catch (_) { }
        }
        return null;
    }
    function isVfxGunSelfHit(player, hitObject) {
        if (!isUnityObjectAlive(player) || !isUnityObjectAlive(hitObject))
            return false;
        try {
            for (const root of localAvatarRoots(player)) {
                if (!isUnityObjectAlive(root))
                    continue;
                if (objectIsWithinRoots(hitObject, [root]))
                    return true;
            }
        }
        catch (_) { }
        return false;
    }
    function ensureVfxGunRaycast() {
        if (vfxGunRaycastReady)
            return;
        vfxGunRaycastReady = true;
        const hitRef = "UnityEngine.RaycastHit&";
        try {
            vfxGunRaycast = Physics.method("Raycast", 6).overload("UnityEngine.Vector3", "UnityEngine.Vector3", hitRef, "System.Single", "System.Int32", "System.Int32");
            vfxGunRaycastMode = "6i";
            return;
        }
        catch (_) { }
        try {
            vfxGunRaycast = Physics.method("Raycast", 6).overload("UnityEngine.Vector3", "UnityEngine.Vector3", hitRef, "System.Single", "System.Int32", "UnityEngine.QueryTriggerInteraction");
            vfxGunRaycastMode = "6enum";
            return;
        }
        catch (_) { }
        try {
            vfxGunRaycast = Physics.method("Raycast", 5).overload("UnityEngine.Vector3", "UnityEngine.Vector3", hitRef, "System.Single", "System.Int32");
            vfxGunRaycastMode = "5";
            return;
        }
        catch (_) { }
        try {
            vfxGunRaycast = Physics.method("Raycast", 4).overload("UnityEngine.Vector3", "UnityEngine.Vector3", hitRef, "System.Single");
            vfxGunRaycastMode = "4";
            return;
        }
        catch (_) {
            vfxGunRaycast = false;
            vfxGunRaycastMode = "";
        }
        if (!isUnityObjectAlive(vfxGunRaycastHitBuffer)) {
            try {
                vfxGunRaycastHitBuffer = Il2Cpp.alloc(128);
                vfxGunRaycastHitRef = Il2Cpp.reference(vfxGunRaycastHitBuffer);
            }
            catch (_) { }
        }
    }
    function invokeVfxGunRaycast(start, direction, distance, player) {
        if (!isUnityObjectAlive(vfxGunRaycast))
            return null;
        if (distance <= 0.0)
            return null;
        if (vfxGunRaycastMode === "6i" || vfxGunRaycastMode === "6enum") {
            if (!vfxGunRaycast.invoke(start, direction, vfxGunRaycastHitBuffer, distance, VFX_GUN_RAYCAST_LAYER_MASK, VFX_GUN_RAYCAST_TRIGGER_INTERACTION))
                return null;
        }
        else if (vfxGunRaycastMode === "5") {
            if (!vfxGunRaycast.invoke(start, direction, vfxGunRaycastHitBuffer, distance, VFX_GUN_RAYCAST_LAYER_MASK))
                return null;
        }
        else if (!vfxGunRaycast.invoke(start, direction, vfxGunRaycastHitBuffer, distance)) {
            return null;
        }
        if (!isUnityObjectAlive(vfxGunRaycastHitRef))
            return null;
        const point = vector3Value(vfxGunRaycastHitRef.method("get_point", 0).invoke());
        if (!point)
            return null;
        let normal = null;
        try {
            normal = vector3Value(vfxGunRaycastHitRef.method("get_normal", 0).invoke());
        }
        catch (_) {
            normal = null;
        }
        let hitDistance = VFX_GUN_RANGE;
        try {
            hitDistance = Number(vfxGunRaycastHitRef.method("get_distance", 0).invoke());
        }
        catch (_) {
            const delta = [
                point[0] - start[0],
                point[1] - start[1],
                point[2] - start[2],
            ];
            hitDistance = Math.sqrt(delta[0] * delta[0] + delta[1] * delta[1] + delta[2] * delta[2]);
        }
        if (!Number.isFinite(hitDistance) || hitDistance <= 0.0)
            return null;
        const hitObject = raycastHitToGameObject(vfxGunRaycastHitRef);
        if (isVfxGunSelfHit(player, hitObject))
            return { start, point, distance: hitDistance, normal, object: null, self: true };
        return { start, point, distance: hitDistance, normal, object: hitObject, self: false };
    }
    function castVfxGunRay(player, start, direction, distance) {
        if (!isUnityObjectAlive(vfxGunRaycast)) {
            ensureVfxGunRaycast();
            if (!isUnityObjectAlive(vfxGunRaycast))
                return null;
        }
        if (!isUnityObjectAlive(vfxGunRaycastHitBuffer)) {
            try {
                vfxGunRaycastHitBuffer = Il2Cpp.alloc(128);
                vfxGunRaycastHitRef = Il2Cpp.reference(vfxGunRaycastHitBuffer);
            }
            catch (_) {
                return null;
            }
        }
        const direct = invokeVfxGunRaycast(start, direction, distance, player);
        if (direct && !direct.self)
            return direct;
        if (direct && direct.self) {
            const shift = VFX_GUN_START_OFFSET * 1.5;
            const shiftedStart = [
                start[0] + direction[0] * shift,
                start[1] + direction[1] * shift,
                start[2] + direction[2] * shift,
            ];
            const shifted = invokeVfxGunRaycast(shiftedStart, direction, Math.max(0.1, distance - shift), player);
            if (shifted && !shifted.self)
                return shifted;
        }
        return null;
    }
    function vfxGunAim(player) {
        const hand = getRightHandTransform(player);
        if (!isUnityObjectAlive(hand))
            return null;
        const handPosition = transformPosition(hand);
        let direction = null;
        try {
            direction = vector3Value(hand.method("get_forward", 0).invoke());
        }
        catch (_) { }
        if (!handPosition || !direction)
            return null;
        const magnitude = Math.sqrt(direction[0] * direction[0] + direction[1] * direction[1] + direction[2] * direction[2]) || 1.0;
        direction = [direction[0] / magnitude, direction[1] / magnitude, direction[2] / magnitude];
        const start = [
            handPosition[0] + direction[0] * 0.08,
            handPosition[1] + direction[1] * 0.08,
            handPosition[2] + direction[2] * 0.08,
        ];
        let end = [
            start[0] + direction[0] * VFX_GUN_RANGE,
            start[1] + direction[1] * VFX_GUN_RANGE,
            start[2] + direction[2] * VFX_GUN_RANGE,
        ];
        const hit = castVfxGunRay(player, start, direction, VFX_GUN_RANGE);
        if (hit && !hit.self && hit.point) {
            end = hit.point;
            if (hit.normal && !Number.isNaN(hit.normal[0])) {
                end = [
                    end[0] - hit.normal[0] * VFX_GUN_HIT_OFFSET,
                    end[1] - hit.normal[1] * VFX_GUN_HIT_OFFSET,
                    end[2] - hit.normal[2] * VFX_GUN_HIT_OFFSET,
                ];
            }
            else {
                end = [
                    end[0] - direction[0] * VFX_GUN_HIT_OFFSET,
                    end[1] - direction[1] * VFX_GUN_HIT_OFFSET,
                    end[2] - direction[2] * VFX_GUN_HIT_OFFSET,
                ];
            }
        }
        return { start, end };
    }
    function recordVfxGunFailure(error) {
        const now = unityNow();
        vfxGunFailureCount = Math.min(6, vfxGunFailureCount + 1);
        const delay = Math.min(8.0, 0.25 * Math.pow(2, vfxGunFailureCount - 1));
        vfxGunDispatchUnavailableUntil = now + delay;
        if (now >= vfxGunNextErrorLogAt) {
            vfxGunNextErrorLogAt = now + 8.0;
            console.error("[" + MENU_NAME + "] Spawn Gun paused for " + delay.toFixed(2) + "s: " + error);
        }
    }
    function updateSpawnGunCoil(start, end) {
        if (!isUnityObjectAlive(vfxGunLine))
            return;
        const delta = [end[0] - start[0], end[1] - start[1], end[2] - start[2]];
        const length = Math.sqrt(delta[0] * delta[0] + delta[1] * delta[1] + delta[2] * delta[2]);
        if (!Number.isFinite(length) || length < 0.001)
            return;
        const direction = [delta[0] / length, delta[1] / length, delta[2] / length];
        const reference = Math.abs(direction[1]) < 0.92 ? [0, 1, 0] : [1, 0, 0];
        let side = [
            direction[1] * reference[2] - direction[2] * reference[1],
            direction[2] * reference[0] - direction[0] * reference[2],
            direction[0] * reference[1] - direction[1] * reference[0],
        ];
        const sideLength = Math.sqrt(side[0] * side[0] + side[1] * side[1] + side[2] * side[2]) || 1.0;
        side = [side[0] / sideLength, side[1] / sideLength, side[2] / sideLength];
        const vertical = [
            side[1] * direction[2] - side[2] * direction[1],
            side[2] * direction[0] - side[0] * direction[2],
            side[0] * direction[1] - side[1] * direction[0],
        ];
        const phaseOffset = unityNow() * (rightTrigger ? 9.0 : 3.5);
        const radius = Math.min(SPAWN_GUN_COIL_RADIUS, Math.max(0.010, length * 0.035));
        for (let index = 0; index < SPAWN_GUN_COIL_POINTS; index++) {
            const t = index / (SPAWN_GUN_COIL_POINTS - 1);
            const envelope = Math.sin(Math.PI * t);
            const phase = t * SPAWN_GUN_COIL_TURNS * Math.PI * 2.0 + phaseOffset;
            const amplitude = radius * envelope;
            const point = [
                start[0] + delta[0] * t + side[0] * Math.cos(phase) * amplitude + vertical[0] * Math.sin(phase) * amplitude,
                start[1] + delta[1] * t + side[1] * Math.cos(phase) * amplitude + vertical[1] * Math.sin(phase) * amplitude,
                start[2] + delta[2] * t + side[2] * Math.cos(phase) * amplitude + vertical[2] * Math.sin(phase) * amplitude,
            ];
            vfxGunLine.method("SetPosition", 2).invoke(index, point);
        }
    }
    function spawnGunPositionValue(player, position) {
        const hand = getRightHandTransform(player);
        if (!isUnityObjectAlive(hand))
            throw new Error("right hand is unavailable");
        const value = hand.method("get_position", 0).invoke();
        if (!(value instanceof Il2Cpp.ValueType))
            throw new Error("Vector3 spawn ABI is unavailable");
        value.field("x").value = position[0];
        value.field("y").value = position[1];
        value.field("z").value = position[2];
        return value;
    }
    function spawnNetworkPrefabFromGun(entry, player, positionValue) {
        if (!entry || !isUnityObjectAlive(entry.networkObject))
            throw new Error("network prefab is unavailable");
        const localPlayer = strictLocalNetworkPlayer();
        const context = rigSpamRunnerForPlayer(localPlayer);
        const prefabId = rigSpamPrefabId(entry.networkObject, context.runner);
        const spawn = resolveRigSpamSpawnMethod();
        if (!spawn)
            throw new Error("Fusion NetworkPrefabId Spawn overload is unavailable");
        const parameters = spawn.parameters;
        const position = makeRigSpamNullable(parameters[1].type, positionValue);
        const rotation = makeRigSpamNullable(parameters[2].type, identityQuaternion);
        const inputAuthority = makeRigSpamNullable(parameters[3].type, null);
        const spawned = spawn.bind(context.runner).invoke(
            prefabId,
            position.value,
            rotation.value,
            inputAuthority.value,
            NULL,
            0);
        if (!isUnityObjectAlive(spawned))
            throw new Error("Fusion returned no NetworkObject");
        try {
            const object = componentGameObject(spawned);
            if (isUnityObjectAlive(object))
                object.method("SetActive", 1).invoke(true);
        }
        catch (_) { }
        return spawned;
    }
    function spawnLocalPrefabFromGun(entry, positionValue) {
        if (!entry || !isUnityObjectAlive(entry.prefab))
            throw new Error("prefab asset is unavailable");
        spawnGunLocalObjects = spawnGunLocalObjects.filter(isUnityObjectAlive);
        while (spawnGunLocalObjects.length >= SPAWN_GUN_MAX_LOCAL_OBJECTS) {
            const oldest = spawnGunLocalObjects.shift();
            if (isUnityObjectAlive(oldest))
                destroy(oldest);
        }
        const clone = UnityObject.method("Instantiate", 3)
            .overload("UnityEngine.Object", "UnityEngine.Vector3", "UnityEngine.Quaternion")
            .invoke(entry.prefab, positionValue, identityQuaternion);
        if (!isUnityObjectAlive(clone))
            throw new Error("Unity returned no prefab instance");
        try {
            setName(clone, entry.name + " (Spawn Gun)");
            clone.method("SetActive", 1).invoke(true);
        }
        catch (_) { }
        spawnGunLocalObjects.push(clone);
        return clone;
    }
    function spawnSelectedPrefabFromGun(player, position) {
        ensureSpawnPrefabCatalog();
        const selected = selectedSpawnPrefabEntry();
        if (!isUnityObjectAlive(selected.prefab))
            throw new Error("no spawn prefab is selected");
        const positionValue = spawnGunPositionValue(player, position);
        if (selected.kind === "network" && isUnityObjectAlive(selected.networkObject)) {
            try {
                spawnNetworkPrefabFromGun(selected, player, positionValue);
                console.log("[" + MENU_NAME + "] Spawn Gun created network prefab: " + selected.name);
                return true;
            }
            catch (networkError) {
                console.warn("[" + MENU_NAME + "] Network spawn rejected for " + selected.name +
                    "; using a visible local instance instead: " + networkError);
            }
        }
        spawnLocalPrefabFromGun(selected, positionValue);
        console.log("[" + MENU_NAME + "] Spawn Gun created local prefab: " + selected.name);
        return true;
    }
    function updateVfxGun(player) {
        if (!mods.vfxGun) {
            spawnGunTriggerWasPressed = false;
            if (isLive(vfxGunRoot) || isLive(vfxGunMaterial))
                destroyVfxGunVisuals();
            return;
        }
        const triggerPressed = rightTrigger && !spawnGunTriggerWasPressed;
        spawnGunTriggerWasPressed = rightTrigger;
        if (!rightGrip || leftSecondary) {
            try {
                if (isUnityObjectAlive(vfxGunRoot))
                    vfxGunRoot.method("SetActive", 1).invoke(false);
            }
            catch (_) { }
            return;
        }
        let aim = null;
        const refreshPointer = frameNumber % VFX_GUN_POINTER_REFRESH_FRAMES === 0 ||
            !vfxGunLastStartPosition || !vfxGunLastEndPosition;
        if (refreshPointer) {
            aim = vfxGunAim(player);
            if (aim) {
                vfxGunLastStartPosition = aim.start;
                vfxGunLastEndPosition = aim.end;
            }
        }
        if (!aim && vfxGunLastStartPosition && vfxGunLastEndPosition) {
            aim = { start: vfxGunLastStartPosition, end: vfxGunLastEndPosition };
        }
        if (!aim) {
            try {
                if (isUnityObjectAlive(vfxGunRoot))
                    vfxGunRoot.method("SetActive", 1).invoke(false);
            }
            catch (_) { }
            return;
        }
        if (refreshPointer && ensureVfxGunVisuals()) {
            try {
                vfxGunRoot.method("SetActive", 1).invoke(true);
            }
            catch (_) { }
            try {
                updateSpawnGunCoil(aim.start, aim.end);
            }
            catch (_) { }
            try {
                getTransform(vfxGunTip).method("set_position", 1).invoke(aim.end);
            }
            catch (_) { }
            const pointerColor = rightTrigger
                ? [1.0, 0.02, 0.04, 1.0]
                : [0.50, 0.0, 0.05, 1.0];
            colorVisualMaterial(vfxGunMaterial, pointerColor);
            try {
                vfxGunLine.method("set_startColor", 1).invoke(pointerColor);
            }
            catch (_) { }
            try {
                vfxGunLine.method("set_endColor", 1).invoke(pointerColor);
            }
            catch (_) { }
        }
        if (!triggerPressed)
            return;
        const now = unityNow();
        if (now < vfxGunNextShotAt || now < vfxGunDispatchUnavailableUntil)
            return;
        vfxGunNextShotAt = now + VFX_GUN_FIRE_INTERVAL;
        try {
            spawnSelectedPrefabFromGun(player, aim.end);
            vfxGunFailureCount = 0;
            vfxGunDispatchUnavailableUntil = -1000.0;
        }
        catch (error) {
            recordVfxGunFailure(error);
        }
    }
    function numericValue(value) {
        try {
            let raw = value;
            for (let depth = 0; depth < 4; depth++) {
                if (typeof raw === "number")
                    return raw;
                if (typeof raw === "bigint")
                    return Number(raw);
                if (raw == null)
                    return Number.NaN;
                try {
                    const enumValue = raw.field("value__").value;
                    if (enumValue !== raw) {
                        raw = enumValue;
                        continue;
                    }
                }
                catch (_) { }
                try {
                    if (raw.value !== undefined && raw.value !== raw) {
                        raw = raw.value;
                        continue;
                    }
                }
                catch (_) { }
                break;
            }
            const number = Number(raw);
            return Number.isFinite(number) ? number : Number.NaN;
        }
        catch (_) {
            return Number.NaN;
        }
    }
    function unityNow() {
        for (const name of ["get_realtimeSinceStartup", "get_unscaledTime", "get_time"]) {
            try {
                const value = Number(Time.method(name, 0).invoke());
                if (Number.isFinite(value))
                    return value;
            }
            catch (_) { }
        }
        return frameNumber / 72.0;
    }
    function tryGetRecorderValue(recorder, name) {
        try {
            return recorder.method("get_" + name, 0).invoke();
        }
        catch (_) { }
        try {
            return recorder.method("get_" + name).invoke();
        }
        catch (_) { }
        try {
            return recorder.field(name).value;
        }
        catch (_) { }
        try {
            return recorder.field(name.charAt(0).toLowerCase() + name.substring(1)).value;
        }
        catch (_) { }
        try {
            return recorder.field("_" + name.charAt(0).toLowerCase() + name.substring(1)).value;
        }
        catch (_) { }
        return undefined;
    }
    function trySetRecorderValue(recorder, name, value) {
        try {
            recorder.method("set_" + name, 1).invoke(value);
            return true;
        }
        catch (_) { }
        try {
            recorder.method("set_" + name).invoke(value);
            return true;
        }
        catch (_) { }
        try {
            recorder.field(name).value = value;
            return true;
        }
        catch (_) { }
        try {
            recorder.field(name.charAt(0).toLowerCase() + name.substring(1)).value = value;
            return true;
        }
        catch (_) { }
        try {
            recorder.field("_" + name.charAt(0).toLowerCase() + name.substring(1)).value = value;
            return true;
        }
        catch (_) { }
        return false;
    }
    function getRecorderAliasValue(recorder, names) {
        for (const name of names) {
            const value = tryGetRecorderValue(recorder, name);
            if (value !== undefined)
                return value;
        }
        return undefined;
    }
    function setRecorderAliasValue(recorder, names, value) {
        let changed = false;
        for (const name of names) {
            if (trySetRecorderValue(recorder, name, value))
                changed = true;
        }
        return changed;
    }
    const recorderSourceNames = [
        "SourceType", "sourceType", "_sourceType",
        "InputSourceType", "inputSourceType", "_inputSourceType",
    ];
    const recorderClipNames = ["AudioClip", "audioClip", "_audioClip"];
    function getRecorderSourceType(recorder) {
        return getRecorderAliasValue(recorder, recorderSourceNames);
    }
    function setRecorderSourceType(recorder, value) {
        return setRecorderAliasValue(recorder, recorderSourceNames, value);
    }
    function getRecorderAudioClip(recorder) {
        return getRecorderAliasValue(recorder, recorderClipNames);
    }
    function setRecorderAudioClip(recorder, clip) {
        return setRecorderAliasValue(recorder, recorderClipNames, clip);
    }
    function restartVoiceRecorder(recorder) {
        try {
            const result = recorder.method("RestartRecording", 0).invoke();
            return result === undefined ? true : !!result;
        }
        catch (_) { }
        try {
            const result = recorder.method("RestartRecording", 1).invoke(true);
            return result === undefined ? true : !!result;
        }
        catch (_) { }
        try {
            recorder.method("StartRecording", 0).invoke();
            return true;
        }
        catch (_) { }
        return false;
    }
    function recorderIsUsable(recorder) {
        if (!isLive(recorder))
            return false;
        try {
            const object = recorder.method("get_gameObject", 0).invoke();
            if (!isLive(object) || !object.method("get_activeInHierarchy", 0).invoke())
                return false;
            const scene = object.method("get_scene", 0).invoke();
            return !!scene.method("IsValid", 0).invoke();
        }
        catch (_) {
            return false;
        }
    }
    function recorderScore(recorder, gameObject, fromCustomVoice) {
        let score = fromCustomVoice ? 60 : 0;
        try {
            const rawName = gameObject.method("get_name", 0).invoke();
            const name = String(rawName?.content ?? rawName?.toString?.() ?? rawName);
            if (name === "NetworkRunner")
                score += 50;
        }
        catch (_) { }
        try {
            if (gameObject.method("get_activeInHierarchy", 0).invoke())
                score += 40;
        }
        catch (_) { }
        try {
            const scene = gameObject.method("get_scene", 0).invoke();
            if (scene.method("IsValid", 0).invoke())
                score += 80;
        }
        catch (_) { }
        try {
            if (tryGetRecorderValue(recorder, "RecordingEnabled"))
                score += 20;
        }
        catch (_) { }
        try {
            if (tryGetRecorderValue(recorder, "TransmitEnabled"))
                score += 15;
        }
        catch (_) { }
        try {
            if (recorder.method("get_IsCurrentlyTransmitting", 0).invoke())
                score += 35;
        }
        catch (_) { }
        return score;
    }
    function findSoundboardRecorder() {
        if (recorderIsUsable(soundboardRecorder))
            return soundboardRecorder;
        soundboardRecorder = null;
        soundboardCustomVoiceRecorder = null;
        if (!PhotonRecorder)
            return null;
        const candidates = [];
        const seen = new Set();
        const addCandidate = (recorder, gameObject, fromCustomVoice, bonus = 0, customVoice = null) => {
            if (!recorderIsUsable(recorder))
                return;
            let key = "";
            try {
                key = String(recorder.handle);
            }
            catch (_) {
                key = String(recorder);
            }
            if (!key || seen.has(key))
                return;
            seen.add(key);
            candidates.push({
                recorder,
                customVoice,
                score: recorderScore(recorder, gameObject, fromCustomVoice) + bonus,
            });
        };
        // Deadeye's authoritative outgoing route is owned by
        // CustomVoiceRecorder, not PlayerVoiceHandler (that class belongs to a
        // different DogeLabs title). Resolve its exact Recorder first.
        if (CustomVoiceRecorder) {
            const customVoices = [];
            const addCustomVoice = (custom) => {
                if (!isUnityObjectAlive(custom) ||
                    customVoices.some(existing => sameObject(existing, custom)))
                    return;
                customVoices.push(custom);
            };
            try {
                addCustomVoice(CustomVoiceRecorder.method("get_Instance", 0).invoke());
            }
            catch (_) { }
            try {
                addCustomVoice(CustomVoiceRecorder.field("<Instance>k__BackingField").value);
            }
            catch (_) { }
            for (const custom of objectsOfClass(CustomVoiceRecorder, true))
                addCustomVoice(custom);
            for (const custom of customVoices) {
                let recorder = null;
                try {
                    recorder = custom.method("get_VoiceRecorder", 0).invoke();
                }
                catch (_) { }
                if (!recorderIsUsable(recorder)) {
                    try {
                        recorder = custom.field("voiceRecorder").value;
                    }
                    catch (_) { }
                }
                if (!recorderIsUsable(recorder))
                    continue;
                addCandidate(recorder, componentGameObject(custom), true, 1500, custom);
            }
        }
        // CustomVoiceRecorder owns the current Recorder and VoiceConnection.
        // This preserves the game's moderation,
        // player/interest-group and push-to-talk routing.
        if (PlayerVoiceHandler) {
            for (const handler of objectsOfClass(PlayerVoiceHandler)) {
                try {
                    if (!componentIsActiveInScene(handler))
                        continue;
                    try {
                        if (!handler.method("get_enabled", 0).invoke())
                            continue;
                    }
                    catch (_) { }
                    const recorder = handler.method("get_VoiceRecorder", 0).invoke();
                    if (!recorderIsUsable(recorder))
                        continue;
                    try {
                        if (!recorder.method("get_enabled", 0).invoke())
                            continue;
                    }
                    catch (_) { }
                    const connection = handler.field("voice").value;
                    const primary = connection.method("get_PrimaryRecorder", 0).invoke();
                    if (!sameObject(primary, recorder))
                        continue;
                    addCandidate(recorder, componentGameObject(handler), false, 500);
                }
                catch (_) { }
            }
        }
        // The VoiceConnection primary is the recorder that is actually bound to
        // the room. Prefer it before considering scene-wide Recorder components.
        if (PhotonVoiceConnection) {
            try {
                const connections = findObjects(PhotonVoiceConnection);
                for (let index = 0; connections && index < connections.length; index++) {
                    try {
                        const connection = connections.get(index);
                        const object = connection.method("get_gameObject", 0).invoke();
                        let recorder = null;
                        try {
                            recorder = connection.method("get_PrimaryRecorder", 0).invoke();
                        }
                        catch (_) { }
                        addCandidate(recorder, object, false);
                    }
                    catch (_) { }
                }
            }
            catch (_) { }
        }
        if (candidates.length > 0) {
            candidates.sort((left, right) => right.score - left.score);
            soundboardRecorder = candidates[0].recorder;
            soundboardCustomVoiceRecorder = candidates[0].customVoice;
            console.log("[" + MENU_NAME + "] Soundboard selected " +
                (isUnityObjectAlive(soundboardCustomVoiceRecorder)
                    ? "Deadeye CustomVoiceRecorder.get_VoiceRecorder()."
                    : "VoiceConnection.PrimaryRecorder fallback."));
            return soundboardRecorder;
        }
        if (CustomVoiceRecorder) {
            try {
                const customRecorders = Resources.method("FindObjectsOfTypeAll", 1)
                    .overload("System.Type")
                    .invoke(CustomVoiceRecorder.type.object);
                for (let index = 0; customRecorders && index < customRecorders.length; index++) {
                    try {
                        const custom = customRecorders.get(index);
                        const object = custom.method("get_gameObject", 0).invoke();
                        let recorder = null;
                        try {
                            recorder = custom.method("get_VoiceRecorder", 0).invoke();
                        }
                        catch (_) { }
                        if (!recorderIsUsable(recorder))
                            recorder = custom.field("voiceRecorder").value;
                        addCandidate(recorder, object, true, 1000, custom);
                    }
                    catch (_) { }
                }
            }
            catch (_) { }
        }
        try {
            const recorders = findObjects(PhotonRecorder);
            for (let index = 0; recorders && index < recorders.length; index++) {
                try {
                    const recorder = recorders.get(index);
                    addCandidate(recorder, recorder.method("get_gameObject", 0).invoke(), false);
                }
                catch (_) { }
            }
        }
        catch (_) { }
        candidates.sort((left, right) => right.score - left.score);
        soundboardRecorder = candidates.length > 0 ? candidates[0].recorder : null;
        soundboardCustomVoiceRecorder = candidates.length > 0 ? candidates[0].customVoice : null;
        if (isLive(soundboardRecorder)) {
            console.log("[" + MENU_NAME + "] Soundboard selected the live Photon Voice recorder.");
        }
        return soundboardRecorder;
    }
    function captureRecorderState(recorder) {
        if (soundboardRecorderState || !isLive(recorder))
            return;
        const values = {};
        for (const name of [
            "LoopAudioClip", "VoiceDetection", "TransmitEnabled",
            "RecordWhenJoined", "RecordingEnabled",
        ])
            values[name] = tryGetRecorderValue(recorder, name);
        values.SourceType = getRecorderSourceType(recorder);
        values.AudioClip = getRecorderAudioClip(recorder);
        soundboardRecorderState = { recorder, values };
    }
    function clearRecorderClip(recorder) {
        setRecorderAudioClip(recorder, null);
    }
    function restoreRecorderState() {
        const state = soundboardRecorderState;
        soundboardRecorderState = null;
        if (!state || !isLive(state.recorder))
            return;
        const recorder = state.recorder;
        trySetRecorderValue(recorder, "RecordingEnabled", false);
        try {
            recorder.method("StopRecording", 0).invoke();
        }
        catch (_) { }
        if (state.values.SourceType !== undefined) {
            setRecorderSourceType(recorder, state.values.SourceType);
        }
        for (const name of ["LoopAudioClip", "VoiceDetection", "TransmitEnabled", "RecordWhenJoined"]) {
            if (state.values[name] !== undefined)
                trySetRecorderValue(recorder, name, state.values[name]);
        }
        if (state.values.AudioClip !== undefined && isLive(state.values.AudioClip)) {
            setRecorderAudioClip(recorder, state.values.AudioClip);
        }
        else {
            clearRecorderClip(recorder);
        }
        const wasRecording = state.values.RecordingEnabled === undefined
            ? true
            : !!state.values.RecordingEnabled;
        trySetRecorderValue(recorder, "RecordingEnabled", wasRecording);
        if (wasRecording)
            restartVoiceRecorder(recorder);
    }
    function startRecorderClip(recorder, clip) {
        if (!isLive(recorder) || !isLive(clip))
            return false;
        if (isUnityObjectAlive(soundboardCustomVoiceRecorder)) {
            try {
                const rawReason = soundboardCustomVoiceRecorder
                    .method("GetVoiceNotWorkingExplanation", 0).invoke();
                const reason = String(rawReason?.content ?? rawReason ?? "").trim();
                if (reason && reason !== "null" && reason !== "undefined")
                    console.log("[" + MENU_NAME + "] Deadeye voice status: " + reason);
            }
            catch (_) { }
            try {
                soundboardCustomVoiceRecorder.method("UpdateVoiceTransmission", 0).invoke();
            }
            catch (_) { }
        }
        captureRecorderState(recorder);
        trySetRecorderValue(recorder, "RecordingEnabled", false);
        try {
            recorder.method("StopRecording", 0).invoke();
        }
        catch (_) { }
        const sourceConfigured = setRecorderSourceType(recorder, 1);
        const clipConfigured = setRecorderAudioClip(recorder, clip);
        trySetRecorderValue(recorder, "LoopAudioClip", false);
        trySetRecorderValue(recorder, "VoiceDetection", false);
        trySetRecorderValue(recorder, "TransmitEnabled", true);
        trySetRecorderValue(recorder, "RecordWhenJoined", true);
        trySetRecorderValue(recorder, "RecordingEnabled", true);
        const restarted = restartVoiceRecorder(recorder);
        let verified = sourceConfigured && clipConfigured;
        const sourceType = numericValue(getRecorderSourceType(recorder));
        if (Number.isFinite(sourceType))
            verified = verified && Math.round(sourceType) === 1;
        const assignedClip = getRecorderAudioClip(recorder);
        if (assignedClip !== undefined)
            verified = verified && sameObject(assignedClip, clip);
        const transmitEnabled = tryGetRecorderValue(recorder, "TransmitEnabled");
        const recordingEnabled = tryGetRecorderValue(recorder, "RecordingEnabled");
        if (transmitEnabled !== undefined)
            verified = verified && !!transmitEnabled;
        if (recordingEnabled !== undefined)
            verified = verified && !!recordingEnabled;
        soundboardTransmitCheckAt = unityNow() + 0.65;
        soundboardTransmitRetries = 0;
        console.log("[" + MENU_NAME + "] Soundboard mic route: source=" + sourceType +
            ", clip=" + (assignedClip === undefined || sameObject(assignedClip, clip)) +
            ", transmit=" + String(transmitEnabled) +
            ", recording=" + String(recordingEnabled) +
            ", restart=" + restarted + ".");
        return verified && restarted;
    }
    function decodeBase64Chunks(chunks) {
        try {
            const nativeAtob = globalThis.atob;
            if (typeof nativeAtob === "function") {
                const decoded = nativeAtob(chunks.join(""));
                const output = new Uint8Array(decoded.length);
                for (let index = 0; index < decoded.length; index++) {
                    output[index] = decoded.charCodeAt(index) & 0xff;
                }
                return output;
            }
            let encodedLength = 0;
            for (const chunk of chunks)
                encodedLength += chunk.length;
            if (encodedLength === 0)
                return null;
            let padding = 0;
            const last = chunks.length > 0 ? chunks[chunks.length - 1] : "";
            if (last.endsWith("=="))
                padding = 2;
            else if (last.endsWith("="))
                padding = 1;
            const output = new Uint8Array(Math.floor(encodedLength * 3 / 4) - padding);
            const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            let accumulator = 0;
            let bitCount = 0;
            let outputIndex = 0;
            for (const chunk of chunks) {
                for (let index = 0; index < chunk.length; index++) {
                    const character = chunk.charAt(index);
                    if (character === "=")
                        break;
                    const value = alphabet.indexOf(character);
                    if (value < 0)
                        continue;
                    accumulator = ((accumulator << 6) | value) >>> 0;
                    bitCount += 6;
                    if (bitCount >= 8) {
                        bitCount -= 8;
                        if (outputIndex < output.length) {
                            output[outputIndex++] = (accumulator >>> bitCount) & 0xff;
                        }
                    }
                }
            }
            return outputIndex === output.length ? output : output.slice(0, outputIndex);
        }
        catch (error) {
            console.error("[" + MENU_NAME + "] Soundboard base64 decode failed: " + error);
            return null;
        }
    }
    function readFourCc(view, offset) {
        return view.getUint32(offset, true);
    }
    function beginWavDecode(soundIndex, bytes) {
        if (bytes.length < 44)
            return false;
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        if (readFourCc(view, 0) !== 0x46464952 || readFourCc(view, 8) !== 0x45564157)
            return false;
        let offset = 12;
        let audioFormat = 0;
        let channels = 0;
        let sampleRate = 0;
        let bitsPerSample = 0;
        let dataOffset = 0;
        let dataSize = 0;
        while (offset + 8 <= bytes.length) {
            const chunkId = readFourCc(view, offset);
            const declaredSize = view.getUint32(offset + 4, true);
            const chunkOffset = offset + 8;
            const chunkSize = Math.min(declaredSize, Math.max(0, bytes.length - chunkOffset));
            if (chunkId === 0x20746d66 && chunkSize >= 16) {
                audioFormat = view.getUint16(chunkOffset, true);
                channels = view.getUint16(chunkOffset + 2, true);
                sampleRate = view.getUint32(chunkOffset + 4, true);
                bitsPerSample = view.getUint16(chunkOffset + 14, true);
                if (audioFormat === 65534 && chunkSize >= 40) {
                    audioFormat = view.getUint16(chunkOffset + 24, true);
                }
            }
            else if (chunkId === 0x61746164) {
                dataOffset = chunkOffset;
                dataSize = chunkSize;
            }
            offset = chunkOffset + chunkSize + (chunkSize & 1);
            if (declaredSize > chunkSize)
                break;
        }
        if ((audioFormat !== 1 && audioFormat !== 3) || channels <= 0 ||
            sampleRate <= 0 || dataOffset <= 0 || dataSize <= 0)
            return false;
        const bytesPerSample = Math.floor(bitsPerSample / 8);
        if (![1, 2, 3, 4].includes(bytesPerSample))
            return false;
        const totalSamples = Math.floor(dataSize / bytesPerSample);
        const frameCount = Math.floor(totalSamples / channels);
        if (frameCount <= 0)
            return false;
        const sound = soundboardSounds[soundIndex];
        const clip = AudioClip.method("Create", 5).invoke(Il2Cpp.string(sound ? sound.label : "rasp_sound"), frameCount, channels, sampleRate, false);
        if (!isLive(clip))
            return false;
        pendingWavDecode = {
            soundIndex,
            bytes,
            view,
            clip,
            audioFormat,
            channels,
            sampleRate,
            bitsPerSample,
            bytesPerSample,
            dataOffset,
            totalSamples: frameCount * channels,
            sampleIndex: 0,
            pcm: new Float32Array(frameCount * channels),
        };
        return true;
    }
    function playLocalSoundPreview(clip) {
        if (!isLive(clip))
            return false;
        // PlayClipAtPoint is stripped in the current build. Use the local
        // player's existing source; PlayOneShot preserves its normal clip.
        try {
            const source = activeLocalPlayer.field("swooshAudioSource").value;
            if (!isLive(source))
                return false;
            source.method("PlayOneShot", 2)
                .overload("UnityEngine.AudioClip", "System.Single")
                .invoke(clip, 1.0);
            console.log("[" + MENU_NAME + "] Soundboard local preview fallback started.");
            return true;
        }
        catch (error) {
            console.error("[" + MENU_NAME + "] Soundboard local preview failed: " + error);
            return false;
        }
    }
    function failSoundboard(message) {
        console.error("[" + MENU_NAME + "] Soundboard: " + message);
        stopSoundboardPlayback(false);
    }
    function refreshSoundboardButtonColors() {
        for (const button of renderedButtons) {
            setRendererColor(button.renderer, buttonColor(button.entry, button.entry.id === hoveredButtonId));
        }
    }
    function voiceHandlerForRecorder(recorder) {
        if (!PlayerVoiceHandler || !isLive(recorder))
            return null;
        for (const handler of objectsOfClass(PlayerVoiceHandler)) {
            try {
                if (!componentIsActiveInScene(handler) ||
                    !sameObject(handler.method("get_VoiceRecorder", 0).invoke(), recorder))
                    continue;
                return handler;
            }
            catch (_) { }
        }
        return null;
    }
    function soundboardVoiceHandlerAllows(recorder) {
        const handler = voiceHandlerForRecorder(recorder);
        if (!isUnityObjectAlive(handler))
            return null;
        let handlerEnabled = true;
        try {
            handlerEnabled = !!handler.method("get_enabled", 0).invoke();
        }
        catch (_) { }
        try {
            if (handler.method("IsLocalUserVoiceBannedOrSyncing", 0).invoke()) {
                console.error("[" + MENU_NAME + "] Soundboard mic route blocked by voice moderation.");
                return null;
            }
        }
        catch (_) { }
        let microphoneActive = false;
        try {
            microphoneActive = !!handler.method("IsLocalUserMicEnabled", 0).invoke();
        }
        catch (_) { }
        // IsMicrophoneActivate is false while PTT is released. It must not gate
        // soundboard setup, otherwise the recorder can never be armed.
        console.log("[" + MENU_NAME + "] Soundboard voice handler: enabled=" +
            handlerEnabled + ", microphoneActive=" + microphoneActive + ".");
        return handler;
    }
    function armSoundboardPushToTalk(handler) {
        if (!isUnityObjectAlive(handler))
            return;
        try {
            handler.method("UpdateVoiceTransmission", 0).invoke();
        }
        catch (_) { }
    }
    function armSoundboardMixer(recorder) {
        if (!soundboardMixerHooksInstalled || !isLive(recorder))
            return false;
        let voice = null;
        try {
            voice = recorder.field("voice").value;
        }
        catch (_) { }
        if (!isLive(voice))
            voice = tryGetRecorderValue(recorder, "Voice");
        if (!isLive(voice))
            return false;
        let voiceType = "";
        try {
            voiceType = String(voice.class.fullName || voice.class.name);
        }
        catch (_) { }
        const compatibleHook = (/Short|Int16/.test(voiceType) && soundboardShortHookInstalled) ||
            (/Float|Single/.test(voiceType) && soundboardFloatHookInstalled);
        if (!compatibleHook)
            return false;
        const handler = voiceHandlerForRecorder(recorder);
        if (!isLive(handler))
            return false;
        try {
            if (!recorder.method("get_enabled", 0).invoke())
                return false;
        }
        catch (_) {
            return false;
        }
        try {
            if (!handler.method("IsLocalUserMicEnabled", 0).invoke())
                return false;
        }
        catch (_) { }
        try {
            if (handler.method("IsLocalUserVoiceBannedOrSyncing", 0).invoke())
                return false;
        }
        catch (_) { }
        let rate = Number.NaN;
        let channels = Number.NaN;
        try {
            const info = voice.field("info").value;
            rate = numericValue(info.field("<SamplingRate>k__BackingField").value);
            channels = numericValue(info.field("<Channels>k__BackingField").value);
        }
        catch (_) { }
        if (!Number.isFinite(rate) || rate < 8000)
            rate = numericValue(tryGetRecorderValue(recorder, "SamplingRate"));
        soundboardVoiceRate = Number.isFinite(rate) && rate >= 8000 ? rate : 24000;
        soundboardVoiceChannels = Number.isFinite(channels) && channels >= 1 && channels <= 2
            ? Math.trunc(channels)
            : 1;
        soundboardOutgoingVoice = voice;
        soundboardRecorder = recorder;
        soundboardMicRouted = true;
        armSoundboardPushToTalk(handler);
        return true;
    }
    function sourcePcmSample(frame) {
        const pcm = soundboardPcm;
        if (!pcm)
            return 0;
        const totalFrames = Math.floor(pcm.length / soundboardPcmChannels);
        const clampedFrame = Math.max(0, Math.min(totalFrames - 1, frame));
        const base = clampedFrame * soundboardPcmChannels;
        let sample = 0;
        for (let channel = 0; channel < soundboardPcmChannels; channel++)
            sample += pcm[base + channel] || 0;
        return sample / soundboardPcmChannels;
    }
    function nextMixedPcmSample() {
        const pcm = soundboardPcm;
        if (!pcm)
            return null;
        const totalFrames = Math.floor(pcm.length / soundboardPcmChannels);
        if (soundboardPcmCursor >= totalFrames) {
            soundboardPcmFinished = true;
            return null;
        }
        const first = Math.floor(soundboardPcmCursor);
        const fraction = soundboardPcmCursor - first;
        const sample = sourcePcmSample(first) * (1 - fraction) + sourcePcmSample(first + 1) * fraction;
        soundboardPcmCursor += soundboardPcmRate / soundboardVoiceRate;
        return sample;
    }
    function mixSoundboardShort(buffer) {
        const length = Number(buffer?.length ?? 0);
        if (length <= 0)
            return;
        const destination = new Int16Array(ArrayBuffer.wrap(buffer.elements.handle, length * Int16Array.BYTES_PER_ELEMENT));
        for (let index = 0; index < length; index += soundboardVoiceChannels) {
            const sample = nextMixedPcmSample();
            if (sample === null)
                break;
            for (let channel = 0; channel < soundboardVoiceChannels && index + channel < length; channel++) {
                const mixed = Math.max(-1, Math.min(1, destination[index + channel] / 32768 + sample * 0.8));
                destination[index + channel] = Math.round(mixed * 32767);
            }
        }
    }
    function mixSoundboardFloat(buffer) {
        const length = Number(buffer?.length ?? 0);
        if (length <= 0)
            return;
        const destination = new Float32Array(ArrayBuffer.wrap(buffer.elements.handle, length * Float32Array.BYTES_PER_ELEMENT));
        for (let index = 0; index < length; index += soundboardVoiceChannels) {
            const sample = nextMixedPcmSample();
            if (sample === null)
                break;
            for (let channel = 0; channel < soundboardVoiceChannels && index + channel < length; channel++) {
                destination[index + channel] = Math.max(-1, Math.min(1, destination[index + channel] + sample * 0.8));
            }
        }
    }
    function restoreSoundboardPushToTalk() {
        soundboardPttState = null;
    }
    function stopSoundboardPlayback(logStop = false) {
        // Restore the game-owned microphone source before destroying the clip
        // that Photon Voice may still reference.
        restoreRecorderState();
        if (pendingWavDecode && isLive(pendingWavDecode.clip))
            destroy(pendingWavDecode.clip);
        pendingWavDecode = null;
        restoreSoundboardPushToTalk();
        soundboardMicRouted = false;
        soundboardRecorder = null;
        soundboardOutgoingVoice = null;
        soundboardPcm = null;
        soundboardPcmCursor = 0;
        soundboardPcmFinished = false;
        if (isLive(currentSoundClip))
            destroy(currentSoundClip);
        currentSoundClip = null;
        soundboardEndTime = 0;
        soundboardTransmitCheckAt = 0;
        soundboardTransmitRetries = 0;
        activeSoundIndex = -1;
        const wasBusy = soundboardBusy;
        soundboardBusy = false;
        if (logStop && wasBusy)
            console.log("[" + MENU_NAME + "] Soundboard stopped.");
        refreshSoundboardButtonColors();
    }
    function playPreparedSound(soundIndex, clip, duration, pcm, sampleRate, channels) {
        currentSoundClip = clip;
        soundboardPcm = pcm;
        soundboardPcmCursor = 0.0;
        soundboardPcmRate = sampleRate;
        soundboardPcmChannels = Math.max(1, channels);
        soundboardPcmFinished = false;
        soundboardMixFault = false;
        soundboardMixFaultLogged = false;
        activeSoundIndex = soundIndex;
        soundboardBusy = true;
        soundboardEndTime = unityNow() + Math.max(0.25, duration) + 0.35;
        const localPlaying = playLocalSoundPreview(clip);
        let micPlaying = false;
        const recorder = findSoundboardRecorder();
        if (isLive(recorder)) {
            const handler = soundboardVoiceHandlerAllows(recorder);
            if (isUnityObjectAlive(handler))
                armSoundboardPushToTalk(handler);
            // Deadeye does not use PlayerVoiceHandler for its outgoing route.
            // Configure its CustomVoiceRecorder-owned Recorder even when no
            // optional PTT handler exists.
            if (startRecorderClip(recorder, clip)) {
                soundboardRecorder = recorder;
                soundboardMicRouted = true;
                micPlaying = true;
            }
            else {
                restoreRecorderState();
            }
        }
        if (!micPlaying && soundboardMixerHooksInstalled && isLive(recorder) &&
            armSoundboardMixer(recorder)) {
            micPlaying = true;
        }
        if (!micPlaying) {
            soundboardRecorder = null;
            soundboardOutgoingVoice = null;
            console.error("[" + MENU_NAME + "] Soundboard mic route is unavailable; local preview will continue.");
        }
        if (!localPlaying && !micPlaying) {
            failSoundboard("Local playback and Photon Voice both failed.");
            return;
        }
        const sound = soundboardSounds[soundIndex];
        const routes = localPlaying && micPlaying ? "locally and through mic" :
            (localPlaying ? "locally" : "through mic");
        console.log("[" + MENU_NAME + "] Playing " + routes + ": " + (sound?.fileName ?? "sound"));
        refreshSoundboardButtonColors();
    }
    function updatePendingWavDecode() {
        const pending = pendingWavDecode;
        if (!pending)
            return;
        try {
            const remaining = pending.totalSamples - pending.sampleIndex;
            if (remaining <= 0) {
                pendingWavDecode = null;
                playPreparedSound(pending.soundIndex, pending.clip, pending.totalSamples / (pending.sampleRate * pending.channels), pending.pcm, pending.sampleRate, pending.channels);
                return;
            }
            // Keep PCM conversion below one Quest frame budget. Writing the
            // managed float[] in one native copy avoids thousands of bridge
            // calls and the old multi-frame hitch.
            let sampleCount = Math.min(8192, remaining);
            if (remaining > sampleCount)
                sampleCount -= sampleCount % pending.channels;
            const samples = new Float32Array(sampleCount);
            for (let index = 0; index < sampleCount; index++) {
                const byteOffset = pending.dataOffset + (pending.sampleIndex + index) * pending.bytesPerSample;
                if (pending.bitsPerSample === 8) {
                    samples[index] = (pending.view.getUint8(byteOffset) - 128) / 128.0;
                }
                else if (pending.bitsPerSample === 16) {
                    samples[index] = pending.view.getInt16(byteOffset, true) / 32768.0;
                }
                else if (pending.bitsPerSample === 24) {
                    const value = pending.view.getUint8(byteOffset) |
                        (pending.view.getUint8(byteOffset + 1) << 8) |
                        (pending.view.getInt8(byteOffset + 2) << 16);
                    samples[index] = value / 8388608.0;
                }
                else if (pending.bitsPerSample === 32 && pending.audioFormat === 3) {
                    samples[index] = pending.view.getFloat32(byteOffset, true);
                }
                else if (pending.bitsPerSample === 32) {
                    samples[index] = pending.view.getInt32(byteOffset, true) / 2147483648.0;
                }
            }
            pending.pcm.set(samples, pending.sampleIndex);
            const sampleArray = Il2Cpp.array(SingleClass, sampleCount);
            sampleArray.elements.handle.writeByteArray(samples.buffer);
            const frameOffset = Math.floor(pending.sampleIndex / pending.channels);
            let wrote = false;
            try {
                wrote = !!pending.clip.method("SetData")
                    .overload("System.Single[]", "System.Int32")
                    .invoke(sampleArray, frameOffset);
            }
            catch (_) {
                wrote = !!pending.clip.method("SetData", 2)
                    .overload("System.Single[]", "System.Int32")
                    .invoke(sampleArray, frameOffset);
            }
            if (!wrote) {
                failSoundboard("Unity could not write the decoded WAV data.");
                return;
            }
            pending.sampleIndex += sampleCount;
        }
        catch (error) {
            failSoundboard("WAV decode failed: " + error);
        }
    }
    function maintainSoundboardRoute() {
        if (!soundboardBusy || !isLive(currentSoundClip))
            return;
        const now = unityNow();
        if (soundboardEndTime > 0 && now >= soundboardEndTime) {
            stopSoundboardPlayback(false);
            return;
        }
        if (soundboardRecorderState) {
            if (!soundboardMicRouted || !recorderIsUsable(soundboardRecorder)) {
                restoreRecorderState();
                restoreSoundboardPushToTalk();
                soundboardMicRouted = false;
                return;
            }
            if (now < soundboardTransmitCheckAt)
                return;
            let routeValid = true;
            const sourceType = numericValue(getRecorderSourceType(soundboardRecorder));
            if (Number.isFinite(sourceType) && Math.round(sourceType) !== 1)
                routeValid = false;
            const assignedClip = getRecorderAudioClip(soundboardRecorder);
            if (assignedClip !== undefined && !sameObject(assignedClip, currentSoundClip))
                routeValid = false;
            for (const name of ["TransmitEnabled", "RecordingEnabled"]) {
                const value = tryGetRecorderValue(soundboardRecorder, name);
                if (value !== undefined && !value)
                    routeValid = false;
            }
            let transmitting = undefined;
            try {
                transmitting = !!soundboardRecorder.method("get_IsCurrentlyTransmitting", 0).invoke();
            }
            catch (_) { }
            if (routeValid && transmitting !== false) {
                soundboardTransmitRetries = 0;
                soundboardTransmitCheckAt = now + 0.5;
                return;
            }
            if (soundboardTransmitRetries < 1) {
                soundboardTransmitRetries++;
                trySetRecorderValue(soundboardRecorder, "RecordingEnabled", false);
                try {
                    soundboardRecorder.method("StopRecording", 0).invoke();
                }
                catch (_) { }
                setRecorderSourceType(soundboardRecorder, 1);
                setRecorderAudioClip(soundboardRecorder, currentSoundClip);
                trySetRecorderValue(soundboardRecorder, "LoopAudioClip", false);
                trySetRecorderValue(soundboardRecorder, "VoiceDetection", false);
                trySetRecorderValue(soundboardRecorder, "TransmitEnabled", true);
                trySetRecorderValue(soundboardRecorder, "RecordWhenJoined", true);
                trySetRecorderValue(soundboardRecorder, "RecordingEnabled", true);
                restartVoiceRecorder(soundboardRecorder);
                soundboardTransmitCheckAt = now + 0.75;
                return;
            }
            restoreRecorderState();
            restoreSoundboardPushToTalk();
            soundboardMicRouted = false;
            soundboardRecorder = null;
            console.error("[" + MENU_NAME + "] Soundboard could not transmit; local preview will continue.");
            return;
        }
        if (!soundboardMixerHooksInstalled)
            return;
        if (soundboardMixFault) {
            if (!soundboardMixFaultLogged) {
                soundboardMixFaultLogged = true;
                soundboardMicRouted = false;
                soundboardOutgoingVoice = null;
                restoreSoundboardPushToTalk();
                console.error("[" + MENU_NAME + "] Soundboard mic mixer stopped safely; local preview will continue.");
            }
            return;
        }
        if (soundboardPcmFinished)
            return;
        if (!soundboardMicRouted || !recorderIsUsable(soundboardRecorder) || !isLive(soundboardOutgoingVoice)) {
            const recorder = findSoundboardRecorder();
            if (isLive(recorder) && armSoundboardMixer(recorder))
                return;
            soundboardMicRouted = false;
            soundboardOutgoingVoice = null;
        }
    }
    function playSoundboardSound(soundIndex) {
        const sound = soundboardSounds[soundIndex];
        if (!sound)
            return;
        stopSoundboardPlayback(false);
        activeSoundIndex = soundIndex;
        soundboardBusy = true;
        const bytes = decodeBase64Chunks(sound.base64Chunks);
        if (!bytes || !beginWavDecode(soundIndex, bytes)) {
            failSoundboard("Unsupported or invalid WAV data for " + sound.fileName + ".");
            return;
        }
        console.log("[" + MENU_NAME + "] Preparing sound: " + sound.fileName);
    }
    function updateSoundboard() {
        updatePendingWavDecode();
        maintainSoundboardRoute();
    }
    // ─── TITLES SYSTEM ──────────────────────────────────────────────────────────
    // These buttons temporarily replace the local player's Fusion-networked XP
    // value. Other clients derive the same built-in rank label from that value.
    // The backend/account XP is never written, so relaunching rejoins with the
    // real progression value.

    function resolveTitleSystem() {
        if (titleSystemResolved)
            return titleSystemClass;
        titleSystemResolved = true;
        const networkPlayerClass = NetworkPlayer;
        if (!networkPlayerClass || !ARProgressionManager || !GradientPalette ||
            !VertexGradient || !Color)
            return null;
        titleSystemClass = {
            networkPlayerClass,
            progressionManagerClass: ARProgressionManager,
            gradientPaletteClass: GradientPalette,
            vertexGradientClass: VertexGradient,
            colorClass: Color,
        };
        console.log("[" + MENU_NAME + "] Temporary ranks bound to Fusion XP and the native rank palette.");
        return titleSystemClass;
    }

    function componentDistanceSquaredFromLocal(value) {
        if (!isUnityObjectAlive(value) || !isUnityObjectAlive(activeLocalPlayer))
            return Number.POSITIVE_INFINITY;
        try {
            const localPosition = vector3Value(getTransform(activeLocalPlayer).method("get_position", 0).invoke());
            const valuePosition = vector3Value(getTransform(value).method("get_position", 0).invoke());
            if (!localPosition || !valuePosition)
                return Number.POSITIVE_INFINITY;
            const dx = valuePosition[0] - localPosition[0];
            const dy = valuePosition[1] - localPosition[1];
            const dz = valuePosition[2] - localPosition[2];
            return dx * dx + dy * dy + dz * dz;
        }
        catch (_) {
            return Number.POSITIVE_INFINITY;
        }
    }
    function findLocalTitleNameTag(system) {
        if (isUnityObjectAlive(titleNameTagTarget))
            return titleNameTagTarget;
        const local = system?.networkPlayerClass
            ? findLocalNetworkPlayer(objectsOfClass(system.networkPlayerClass))
            : null;
        if (isUnityObjectAlive(local)) {
            titleNameTagTarget = local;
            return local;
        }
        return null;
    }
    function findLocalTitleSpawner(system) {
        if (isUnityObjectAlive(titleNameTagSpawner))
            return titleNameTagSpawner;
        if (!system?.spawnerClass)
            return null;
        const candidates = objectsOfClass(system.spawnerClass, true);
        for (const candidate of candidates) {
            try {
                if (!!candidate.method("get_IsConnected", 0).invoke()) {
                    titleNameTagSpawner = candidate;
                    return candidate;
                }
            }
            catch (_) { }
        }
        if (candidates.length === 1) {
            titleNameTagSpawner = candidates[0];
            return candidates[0];
        }
        return null;
    }
    function managedStringContent(value) {
        if (value === null || value === undefined)
            return "";
        try {
            if (typeof value.content === "string")
                return value.content;
        }
        catch (_) { }
        let boxed = null;
        try {
            boxed = value.box();
        }
        catch (_) { }
        for (const candidate of [value, boxed]) {
            if (!candidate)
                continue;
            try {
                const result = candidate.method("ToString", 0).invoke();
                if (result && typeof result.content === "string")
                    return result.content;
            }
            catch (_) { }
        }
        return "";
    }
    function playerRankCanvases(target) {
        if (!isUnityObjectAlive(target))
            return [];
        const canvases = [];
        for (const fieldName of ["UICanvas", "mirrorCanvas"]) {
            try {
                const canvas = target.field(fieldName).value;
                if (isUnityObjectAlive(canvas) &&
                    !canvases.some(existing => sameObject(existing, canvas))) {
                    canvases.push(canvas);
                }
            }
            catch (_) { }
        }
        return canvases;
    }
    function readCurrentRankText(target) {
        for (const canvas of playerRankCanvases(target)) {
            for (const fieldName of ["textRank", "worldRank"]) {
                try {
                    const text = canvas.field(fieldName).value;
                    if (!isUnityObjectAlive(text))
                        continue;
                    const value = managedStringContent(text.method("get_text", 0).invoke()).trim();
                    if (value)
                        return value;
                }
                catch (_) { }
            }
        }
        return "";
    }
    function convertTitleNetworkString(setter, text) {
        let parameterClass = null;
        try {
            parameterClass = setter.parameters[0].type.class;
        }
        catch (_) {
            return null;
        }
        try {
            for (const method of parameterClass.methods || []) {
                if (String(method.name) !== "op_Implicit" || method.parameterCount !== 1)
                    continue;
                const inputType = String(method.parameters[0]?.type?.name || "");
                if (!/System\.String/.test(inputType))
                    continue;
                return method.invoke(Il2Cpp.string(text));
            }
        }
        catch (_) { }
        return null;
    }
    function titleProgressionManager(system) {
        try {
            const manager = system.progressionManagerClass.field("Instance").value;
            return isUnityObjectAlive(manager) ? manager : null;
        }
        catch (_) {
            return null;
        }
    }
    function minimumXpForTitleLevel(system, level) {
        const wanted = Math.max(1, Math.min(87, Math.trunc(level)));
        if (titleXpByLevel.has(wanted))
            return titleXpByLevel.get(wanted);
        const manager = titleProgressionManager(system);
        if (!manager)
            return null;
        try {
            const getLevel = manager.method("GetLevel", 1);
            let low = 0;
            let high = 2147483647;
            if (Number(getLevel.invoke(high)) < wanted)
                return null;
            while (low < high) {
                const middle = Math.floor(low + (high - low) / 2);
                if (Number(getLevel.invoke(middle)) >= wanted)
                    high = middle;
                else
                    low = middle + 1;
            }
            titleXpByLevel.set(wanted, low);
            return low;
        }
        catch (_) {
            return null;
        }
    }
    function parseRankColor(system, text) {
        const match = String(text || "").trim().match(/^#?([0-9a-f]{8}|[0-9a-f]{6})$/i);
        if (!match)
            return null;
        const hex = match[1].length === 6 ? match[1] + "FF" : match[1];
        try {
            const boxed = system.colorClass.alloc();
            boxed.method(".ctor", 4).invoke(
                parseInt(hex.slice(0, 2), 16) / 255,
                parseInt(hex.slice(2, 4), 16) / 255,
                parseInt(hex.slice(4, 6), 16) / 255,
                parseInt(hex.slice(6, 8), 16) / 255,
            );
            return boxed.unbox();
        }
        catch (_) {
            return null;
        }
    }
    function nativeRankGradient(system, level) {
        try {
            const palette = system.gradientPaletteClass.field("ByLevel").value;
            const definition = palette.method("get_Item", 1).invoke(level);
            const read = name => managedStringContent(
                definition.field("<" + name + ">k__BackingField").value,
            );
            const colors = [
                parseRankColor(system, read("TopLeft")),
                parseRankColor(system, read("TopRight")),
                parseRankColor(system, read("BottomLeft")),
                parseRankColor(system, read("BottomRight")),
            ];
            if (colors.some(color => !color))
                return null;
            const gradient = system.vertexGradientClass.alloc().unbox();
            gradient.field("topLeft").value = colors[0];
            gradient.field("topRight").value = colors[1];
            gradient.field("bottomLeft").value = colors[2];
            gradient.field("bottomRight").value = colors[3];
            return gradient;
        }
        catch (_) {
            return null;
        }
    }
    function applyNativeRankGradient(system, target, level) {
        const gradient = nativeRankGradient(system, level);
        if (!gradient)
            return 0;
        let updated = 0;
        for (const canvas of playerRankCanvases(target)) {
            for (const fieldName of ["textRank", "worldRank"]) {
                try {
                    const rankText = canvas.field(fieldName).value;
                    if (!isUnityObjectAlive(rankText))
                        continue;
                    rankText.method("set_enableVertexGradient", 1).invoke(true);
                    rankText.method("set_colorGradient", 1).invoke(gradient);
                    updated++;
                }
                catch (_) { }
            }
        }
        return updated;
    }
    function setReplicatedTitle(system, target, text, level) {
        if (!isUnityObjectAlive(target))
            return false;
        const xp = minimumXpForTitleLevel(system, level);
        if (xp === null)
            return false;
        try {
            if (!target.method("get_HasStateAuthority", 0).invoke())
                return false;
            if (!isUnityObjectAlive(titleNetworkPlayer) || !sameObject(titleNetworkPlayer, target)) {
                titleNetworkPlayer = target;
                titleOriginalNetworkXp = Number(target.method("get_XP", 0).invoke());
            }
            if (Number(target.method("get_XP", 0).invoke()) !== xp)
                target.method("set_XP", 1).invoke(xp);
            if (Number(target.method("get_XP", 0).invoke()) !== xp)
                return false;
        }
        catch (_) {
            return false;
        }
        let updated = 0;
        for (const canvas of playerRankCanvases(target)) {
            for (const fieldName of ["textRank", "worldRank"]) {
                try {
                    const rankText = canvas.field(fieldName).value;
                    if (!isUnityObjectAlive(rankText))
                        continue;
                    rankText.method("set_text", 1).invoke(Il2Cpp.string(text));
                    updated++;
                }
                catch (_) { }
            }
        }
        applyNativeRankGradient(system, target, level);
        return updated > 0;
    }
    function titleLabel(titleId, titleIndex) {
        const exact = ANIMAL_RIVALS_TITLES.find(title => title.id === titleId);
        const fallback = ANIMAL_RIVALS_TITLES[Math.max(0, titleIndex) % ANIMAL_RIVALS_TITLES.length];
        return String((exact || fallback)?.label || titleId).slice(0, 48);
    }
    function titleNetworkText(label, target) {
        if (!titleOriginalRankText && isUnityObjectAlive(target))
            titleOriginalRankText = readCurrentRankText(target);
        return String(label).slice(0, 63);
    }
    function reportTitleUnavailable(message) {
        const now = unityNow();
        if (now < titleNextErrorAt)
            return;
        titleNextErrorAt = now + 5.0;
        console.warn("[" + MENU_NAME + "] Titles: " + message);
    }
    function equipTitleRaw(titleId, titleIndex) {
        const system = resolveTitleSystem();
        if (!system) {
            reportTitleUnavailable("the local NetworkPlayer rank canvas is unavailable in this scene.");
            return false;
        }
        const definition = ANIMAL_RIVALS_TITLES.find(title => title.id === titleId) ||
            ANIMAL_RIVALS_TITLES[Math.max(0, titleIndex) % ANIMAL_RIVALS_TITLES.length];
        const label = titleLabel(titleId, titleIndex);
        const level = Number(definition?.level || 1);
        const target = findLocalTitleNameTag(system);
        const text = titleNetworkText(label, target);
        if (isUnityObjectAlive(target) && setReplicatedTitle(system, target, text, level)) {
            activeTemporaryTitleText = text;
            activeTemporaryTitleLevel = level;
            titleStickyRefreshFrame = frameNumber + TITLE_STICKY_REFRESH_FRAMES;
            console.log("[" + MENU_NAME + "] Session rank: " + label +
                " (level " + level + ", local session XP verified; account leaderboard unchanged; remote display unverified).");
            return true;
        }
        reportTitleUnavailable("waiting for the local player's rank canvas.");
        return false;
    }
    function equipTitleById(titleId) {
        const index = ANIMAL_RIVALS_TITLES.findIndex(t => t.id === titleId);
        const label = index >= 0 ? ANIMAL_RIVALS_TITLES[index].label : titleId;
        const result = equipTitleRaw(titleId, Math.max(0, index));
        if (result)
            console.log("[" + MENU_NAME + "] Temporary rank equipped: " + label);
    }

    function updateTitleSpam() {
        if (!mods.titleSpam)
            return;
        const now = unityNow();
        if (now < lastTitleSpamAt + TITLE_SPAM_INTERVAL_SECONDS)
            return;
        lastTitleSpamAt = now;
        const index = titleSpamIndex % ANIMAL_RIVALS_TITLES.length;
        const titleDef = ANIMAL_RIVALS_TITLES[index];
        titleSpamIndex++;
        equipTitleRaw(titleDef.id, index);
    }

    function updateTemporaryTitle() {
        if (!activeTemporaryTitleText || !activeTemporaryTitleLevel || mods.titleSpam ||
            frameNumber < titleStickyRefreshFrame)
            return;
        titleStickyRefreshFrame = frameNumber + TITLE_STICKY_REFRESH_FRAMES;
        const system = resolveTitleSystem();
        const target = system ? findLocalTitleNameTag(system) : null;
        if (isUnityObjectAlive(target))
            setReplicatedTitle(system, target, activeTemporaryTitleText, activeTemporaryTitleLevel);
    }

    // ─── END TITLES SYSTEM ───────────────────────────────────────────────────────

    function tick(player) {
        frameNumber++;
        updatePendingTeleportRepeats();
        updateInput(player);
        updateUnlockTransitionRestore(player);
        pruneRigSpamClones();
        updateSoundboard();
        if (pendingAmmoSweep) {
            sweepAmmo();
            pendingAmmoSweep = false;
        }
        else if (mods.infiniteAmmo && frameNumber % 120 === 0) {
            sweepAmmo();
        }
        if (pendingCooldownReset && frameNumber >= cooldownResetRetryFrame) {
            if (resetFireRateTimers())
                pendingCooldownReset = false;
            else
                cooldownResetRetryFrame = frameNumber + 60;
        }
        const scheduledUnlockRefresh = unlockRefreshFrames.length > 0 &&
            frameNumber >= unlockRefreshFrames[0];
        if (pendingUnlockRefresh || scheduledUnlockRefresh) {
            const verbose = pendingUnlockRefresh;
            pendingUnlockRefresh = false;
            while (unlockRefreshFrames.length > 0 && frameNumber >= unlockRefreshFrames[0]) {
                unlockRefreshFrames.shift();
            }
            refreshUnlockViews(verbose);
        }
        if ((pendingInvincibilityRefresh && frameNumber % 30 === 0) ||
            (mods.invincibility && frameNumber % 60 === 0)) {
            if (setGodMode(mods.invincibility))
                pendingInvincibilityRefresh = false;
        }
        updateInvisibility();
        updateTemporaryTitle();
        updateTitleSpam();
        const nukeWasActive = pendingNukeGrenades > 0;
        if (nukeWasActive)
            updateNuke(player);
        if (!nukeWasActive && mods.grenadeLauncher && !leftSecondary && rightTrigger) {
            launchGrenadeFromHand(player);
        }
        if (!mods.speedBoost)
            restoreSpeedBoost();
        if (!mods.longArms)
            restoreLongArms();
        if (!mods.joystickFly)
            restoreJoystickFly();
        if (!mods.spinBot)
            restoreRigSpin();
        if (!mods.extendHitboxes)
            restoreExtendHitboxes();
        applyLongArms(player);
        applyRigSpin(player);
        updateAimbot();
        applyExtendHitboxes(player);
        updateMenu(player);
        applySpeedBoost(player);
        applyJoystickFly(player);
        applyTriggerFly(player);
        updatePlatforms(player);
        updateVfxGun(player);
        updateVisuals(player);
    }
    function installHook(method, label, block) {
        try {
            // Cache the original NativeFunction before Interceptor.replace so
            // method.invokeRaw() inside the replacement reaches the trampoline.
            void method.nativeFunction;
            method.implementation = block;
            console.log("[" + MENU_NAME + "] Hooked " + label + ".");
            return true;
        }
        catch (error) {
            console.error("[" + MENU_NAME + "] Failed to hook " + label + ": " + error);
            return false;
        }
    }
    function installFusionRoomTransitionGuards() {
        if (!FusionNetworkRunner)
            return;
        const hookedAddresses = new Set();
        for (const method of FusionNetworkRunner.methods || []) {
            try {
                if ((method.name !== "StartGame" && method.name !== "Shutdown") ||
                    method.isStatic || method.isGeneric || method.isInflated ||
                    method.virtualAddress.isNull()) {
                    continue;
                }
                const address = String(method.virtualAddress);
                if (hookedAddresses.has(address))
                    continue;
                hookedAddresses.add(address);
                const transitionName = method.name === "StartGame"
                    ? "Fusion room startup"
                    : "Fusion room shutdown";
                // Observe entry without replacing the managed method. Fusion's
                // overloads can share one native body even when their managed
                // signatures differ; replacing that body with one overload's
                // NativeCallback corrupts the arguments and stalls Shutdown.
                Interceptor.attach(method.virtualAddress, {
                    onEnter() {
                        try {
                            prepareUnlockAllForRoomTransition(transitionName);
                        }
                        catch (error) {
                            console.error("[" + MENU_NAME + "] " + transitionName +
                                " guard error: " + error);
                        }
                    },
                });
                console.log("[" + MENU_NAME + "] Watching Fusion.NetworkRunner." +
                    method.name + " for safe Unlock All transitions.");
            }
            catch (_) { }
        }
    }
    installFusionRoomTransitionGuards();
    function installLobbyWeaponGuard(klass, methodName) {
        if (!klass)
            return false;
        try {
            const method = klass.method(methodName, 0);
            if (method.returnType.name !== "System.Boolean" || method.virtualAddress.isNull())
                return false;
            return installHook(method, klass.fullName + "." + methodName + " lobby guard", function () {
                const allowed = !!method.invokeRaw(this);
                return mods.useGunsInLobby ? true : allowed;
            });
        }
        catch (_) {
            return false;
        }
    }
    function syncLobbyWeaponDamageGate() {
        try {
            const field = WeaponBase.field("canAnyWeaponShootOrDamage");
            if (mods.killInLobby) {
                if (lobbyWeaponDamageGateState === null)
                    lobbyWeaponDamageGateState = !!field.value;
                field.value = true;
            }
            else if (lobbyWeaponDamageGateState !== null) {
                field.value = lobbyWeaponDamageGateState;
                lobbyWeaponDamageGateState = null;
            }
        }
        catch (_) { }
    }
    function refreshClipboardLobbyAccess() {
        if (!ClipboardWeapon)
            return;
        for (const clipboard of objectsOfClass(ClipboardWeapon, true)) {
            if (!isUnityObjectAlive(clipboard))
                continue;
            for (const methodName of [
                "LoadActions", "GenerateButtons", "EnsureSelectPlayerAction",
                "RefreshActionPresentation", "RefreshActionButtonLabels", "RefreshButtonSelection",
            ]) {
                try {
                    clipboard.method(methodName, 0).invoke();
                }
                catch (_) { }
            }
        }
    }
    function installClipboardLobbyGuard(methodName) {
        if (!ClipboardWeapon)
            return false;
        try {
            const method = ClipboardWeapon.method(methodName, 0);
            if (method.returnType.name !== "System.Boolean" || method.virtualAddress.isNull())
                return false;
            return installHook(method, "ClipboardWeapon." + methodName + " lobby access", function () {
                const allowed = !!method.invokeRaw(this);
                return (mods.killInLobby || mods.unlockAll) ? true : allowed;
            });
        }
        catch (_) {
            return false;
        }
    }
    function installLobbyOverrides() {
        try {
            const isPlayerValid = ClipboardWeapon.method("IsPlayerValid", 1);
            if (isPlayerValid.returnType.name === "System.Boolean" && !isPlayerValid.virtualAddress.isNull()) {
                installHook(isPlayerValid, "ClipboardWeapon.IsPlayerValid lobby guard", function (player) {
                    const valid = !!isPlayerValid.invokeRaw(this, player);
                    return (mods.killInLobby || mods.unlockAll) ? true : valid;
                });
            }
        }
        catch (_) { }
        installClipboardLobbyGuard("CanUseClipboard");
        installClipboardLobbyGuard("EnforceDeveloperAccess");
        for (const methodName of [
            "CanShootWeapon", "IsShootingValid",
            "CanShoot", "CanUseWeapon", "get_CanShoot", "get_CanFire",
        ])
            installLobbyWeaponGuard(WeaponBase, methodName);
        for (const methodName of ["CanUseWeapons", "get_CanUseWeapons", "get_CanUseGuns"])
            installLobbyWeaponGuard(PlayerController, methodName);
        syncLobbyWeaponDamageGate();
        try {
            Script.bindWeak(globalThis, () => {
                mods.killInLobby = false;
                syncLobbyWeaponDamageGate();
            });
        }
        catch (_) { }
    }
    installLobbyOverrides();

    // FIX: Kill in Lobby - hook HealthManager / PlayerHealth TakeDamage so damage
    // actually lands in lobby even when the lobby's match-state gate blocks it at
    // the weapon layer. The weapon hooks (CanShootWeapon etc.) return true but the
    // health component has its own IsInMatch guard. We override it here.
    (function installLobbyHealthGuard() {
        const healthClassNames = [
            "HealthManager", "PlayerHealth", "DLARHealth",
            "DLAR_HealthManager", "DLAR_PlayerHealth",
            "Animals.HealthManager", "Animals.PlayerHealth",
        ];
        // Bool gatekeepers that block damage in lobby
        const healthBoolGuards = [
            "get_CanTakeDamage", "CanTakeDamage",
            "get_IsAlive", "IsAlive",
            "get_IsInMatch", "IsInMatch",
            "get_IsGameActive", "IsGameActive",
            "get_DamageEnabled", "DamageEnabled",
        ];
        // Void methods we want to allow through even out of match
        const healthVoidGuards = [
            "ApplyDamage", "TakeDamage", "DealDamage",
            "ReceiveDamage", "AddDamage", "OnDamageReceived",
        ];
        for (const className of healthClassNames) {
            const klass = resolveClass(className);
            if (!klass) continue;
            // Override all bool guards to return true when killInLobby is active
            for (const methodName of healthBoolGuards) {
                try {
                    let method = null;
                    try { method = klass.method(methodName, 0); } catch (_) {}
                    if (!method) continue;
                    if (method.returnType.name !== "System.Boolean" ||
                        method.virtualAddress.isNull()) continue;
                    installHook(method, className + "." + methodName + " lobby kill guard",
                        function () {
                            if (mods.killInLobby) return true;
                            return !!method.invokeRaw(this);
                        });
                }
                catch (_) {}
            }
            // For TakeDamage / ApplyDamage: hook to bypass any early-return
            // by temporarily patching the CanTakeDamage field if it exists
            for (const methodName of healthVoidGuards) {
                try {
                    let method = null;
                    try { method = klass.method(methodName, -1); } catch (_) {}
                    if (!method || method.virtualAddress.isNull()) continue;
                    if (method.returnType.name !== "System.Void") continue;
                    installHook(method, className + "." + methodName + " lobby kill passthrough",
                        function (...args) {
                            if (mods.killInLobby) {
                                // Temporarily enable damage flag fields if they exist
                                const flagNames = [
                                    "canTakeDamage", "_canTakeDamage", "damageEnabled",
                                    "isInMatch", "_isInMatch", "gameActive",
                                ];
                                const restored = [];
                                for (const f of flagNames) {
                                    try {
                                        const field = this.field(f);
                                        const orig = field.value;
                                        if (orig === false || orig === 0) {
                                            field.value = true;
                                            restored.push({ field, orig });
                                        }
                                    }
                                    catch (_) {}
                                }
                                try {
                                    method.invokeRaw(this, ...args);
                                }
                                finally {
                                    for (const { field, orig } of restored) {
                                        try { field.value = orig; }
                                        catch (_) {}
                                    }
                                }
                                return;
                            }
                            method.invokeRaw(this, ...args);
                        });
                    break; // only hook first matched overload per class
                }
                catch (_) {}
            }
            console.log("[" + MENU_NAME + "] Lobby health guard installed for " + className + ".");
        }
    })();

    function installSoundboardMixerHooks() {
        if (!PhotonVoiceCoreImage)
            return;
        try {
            const variants = [
                {
                    typeName: "System.Int16[]", label: "short",
                    concrete: "Photon.Voice.LocalVoiceAudioShort", mix: mixSoundboardShort,
                },
                {
                    typeName: "System.Single[]", label: "float",
                    concrete: "Photon.Voice.LocalVoiceAudioFloat", mix: mixSoundboardFloat,
                },
            ];
            let installed = 0;
            const resolved = [];
            for (const variant of variants) {
                try {
                    let push = null;
                    // Resolve the already-inflated concrete hierarchy. Avoid
                    // MakeGenericType on this stripped Unity 6 build.
                    let current = PhotonVoiceCoreImage.class(variant.concrete);
                    while (current && !push) {
                        try {
                            push = current.method("PushData", 1).overload(variant.typeName);
                        }
                        catch (_) { }
                        try {
                            current = current.parent;
                        }
                        catch (_) {
                            current = null;
                        }
                    }
                    if (!push)
                        continue;
                    if (push.returnType.name !== "System.Void" || push.parameterCount !== 1 ||
                        push.virtualAddress.isNull())
                        continue;
                    const address = String(push.virtualAddress);
                    resolved.push({ variant, push, address });
                }
                catch (_) { }
            }
            const addressCounts = new Map();
            for (const item of resolved) {
                addressCounts.set(item.address, (addressCounts.get(item.address) || 0) + 1);
            }
            for (const item of resolved) {
                if (addressCounts.get(item.address) !== 1)
                    continue;
                const { variant, push } = item;
                try {
                    const hooked = installHook(push, "Photon Voice " + variant.label + " outgoing mixer", function (buffer) {
                        if (soundboardBusy && soundboardPcm && !soundboardMixFault &&
                            sameObject(this, soundboardOutgoingVoice)) {
                            try {
                                variant.mix(buffer);
                            }
                            catch (_) {
                                soundboardMixFault = true;
                            }
                        }
                        push.invokeRaw(this, buffer);
                    });
                    if (hooked) {
                        installed++;
                        if (variant.label === "short")
                            soundboardShortHookInstalled = true;
                        else
                            soundboardFloatHookInstalled = true;
                    }
                }
                catch (_) { }
            }
            soundboardMixerHooksInstalled = installed > 0;
            if (!soundboardMixerHooksInstalled) {
                console.error("[" + MENU_NAME + "] Soundboard outgoing mixer hook is unavailable.");
            }
        }
        catch (_) {
            soundboardMixerHooksInstalled = false;
        }
    }
    if (ENABLE_EXPERIMENTAL_MIC_MIXER) {
        installSoundboardMixerHooks();
    }
    else {
        console.log("[" + MENU_NAME + "] Native soundboard mixer disabled; stable Photon Recorder mic routing is enabled.");
    }
    function installUnlockBooleanHook(klass, methodName, parameterTypes, unlockedValue, expectedStatic) {
        if (!klass) {
            console.error("[" + MENU_NAME + "] Unlock class missing for " + methodName + ".");
            return;
        }
        try {
            let method = klass.method(methodName, parameterTypes.length);
            if (parameterTypes.length > 0)
                method = method.overload(...parameterTypes);
            if (method.returnType.name !== "System.Boolean" ||
                method.parameterCount !== parameterTypes.length ||
                method.isStatic !== expectedStatic || method.isGeneric || method.isInflated ||
                method.virtualAddress.isNull()) {
                throw new Error("signature guard failed");
            }
            const label = klass.fullName + "." + methodName;
            installHook(method, label, function (...args) {
                if (mods.unlockAll)
                    return unlockedValue;
                return !!method.invokeRaw(this, ...args);
            });
        }
        catch (error) {
            console.error("[" + MENU_NAME + "] Skipped unlock hook " +
                klass.fullName + "." + methodName + ": " + error);
        }
    }
    function installAppearanceAvailabilityHook(methodName, itemType) {
        if (!WeaponSkins)
            return;
        try {
            const method = WeaponSkins.method(methodName, 3).overload(itemType, "System.Boolean&", "System.Boolean&");
            if (method.returnType.name !== "System.Void" || method.isStatic ||
                method.isGeneric || method.isInflated || method.virtualAddress.isNull()) {
                throw new Error("signature guard failed");
            }
            installHook(method, WeaponSkins.fullName + "." + methodName, function (item, storeUnlocked, contractUnlocked) {
                if (mods.unlockAll) {
                    // Preserve any bookkeeping performed by the game's
                    // availability query, then override only its outputs.
                    method.invokeRaw(this, item, storeUnlocked, contractUnlocked);
                    storeUnlocked.value = true;
                    contractUnlocked.value = true;
                    return;
                }
                method.invokeRaw(this, item, storeUnlocked, contractUnlocked);
            });
        }
        catch (error) {
            console.error("[" + MENU_NAME + "] Skipped appearance hook " + methodName + ": " + error);
        }
    }
    function installUnlockOnEnableRefresh(klass, methodNames, prepare) {
        if (!klass)
            return;
        try {
            const onEnable = klass.method("OnEnable", 0);
            if (onEnable.isStatic || onEnable.returnType.name !== "System.Void" ||
                onEnable.virtualAddress.isNull())
                return;
            installHook(onEnable, klass.fullName + ".OnEnable unlock refresh", function () {
                if (mods.unlockAll && prepare) {
                    try {
                        prepare(this);
                    }
                    catch (_) { }
                }
                onEnable.invokeRaw(this);
                if (!mods.unlockAll)
                    return;
                for (const methodName of methodNames) {
                    try {
                        this.method(methodName, 0).invoke();
                    }
                    catch (_) { }
                }
            });
        }
        catch (_) { }
    }
    // Runtime-only presentation and selection guards for the local locker.
    // The Fusion StartGame/Shutdown guards preserve these answers while a room
    // transition rebuilds inventory and loadout state.
    installUnlockBooleanHook(PlayfabItem, "IsItemUnlocked", [], true, false);
    installUnlockBooleanHook(PlayerCosmeticsLockerPanel, "IsItemOwned", ["System.String"], true, false);
    installUnlockBooleanHook(UITouchCosmeticSelection, "get_IsOwned", [], true, false);
    installUnlockBooleanHook(UITouchWeaponSelection, "IsCurrentInventoryWeaponLicensed", [], true, false);
    installUnlockBooleanHook(MannequinLockerManager, "CheckIfCanSetNewEquippedItem", ["System.Int32", "System.Int32"], true, false);
    installUnlockBooleanHook(PlayFabManagerClient, "get_ItemTestingOverrideEnabled", [], true, false);
    installUnlockBooleanHook(PlayFabManagerClient, "IsItemTestingExcluded", ["System.String"], false, false);
    installUnlockBooleanHook(PlayFabManagerClient, "IsCatalogItemAvailable", ["DLCatalogItem", "System.DateTime"], true, true);
    installUnlockBooleanHook(PlayFabManagerClient, "IsDLItemInCachedInventory", ["DLCatalogItem", "System.String"], true, false);
    installUnlockBooleanHook(PlayFabManagerClient, "IsDLItemInCachedInventoryForStackOrGlobal", ["DLCatalogItem", "System.String"], true, false);
    installUnlockBooleanHook(PlayFabManagerClient, "IsCatalogItemInInventory", ["System.String", "System.String"], true, false);
    installUnlockBooleanHook(PlayFabManagerClient, "IsCatalogItemInInventoryForStackOrGlobal", ["System.String", "System.String"], true, false);
    installUnlockBooleanHook(PlayFabManagerClient, "IsBundleItemInInventory", ["DLCatalogItem"], true, false);
    installUnlockBooleanHook(UITouchWeaponSelection, "ShouldLockWeapon", ["DLAR_WeaponBase"], false, true);
    installUnlockBooleanHook(WeaponsManager, "IsLocalAccountOwnedWeapon", ["System.String"], true, true);
    installUnlockBooleanHook(WeaponsManager, "IsLocalAccountLicensedInventoryWeapon", ["DLAR_WeaponBase", "InventoryItemDefinition"], true, true);
    installUnlockBooleanHook(WeaponsManager, "get_ShouldRestrictCurrentLoadoutByActiveInventory", [], false, true);
    installUnlockBooleanHook(WeaponsManager, "ShouldUseActiveInventoryRestriction", ["WeaponsManager.LoadoutDataStore"], false, true);
    installUnlockBooleanHook(UIPanelLoadout, "CanShowPrivilegedWeapon", ["DLAR_WeaponBase"], true, true);
    installUnlockBooleanHook(UIPanelLoadout, "IsWeaponAllowedInCurrentMode", ["DLAR_WeaponBase"], true, true);
    installUnlockBooleanHook(UIPanelLoadout, "IsWeaponAllowedInCurrentMode", ["DLAR_WeaponBase", "System.Nullable<NetworkedItemData>"], true, true);
    installUnlockBooleanHook(UIPanelLoadout, "IsWeaponAllowedByCurrentGameMode", ["DLAR_WeaponBase"], true, true);
    installUnlockBooleanHook(UIPanelLoadout, "ShouldIgnoreLoadoutCostInCurrentMode", [], true, true);
    installUnlockBooleanHook(UIPanelLoadout, "RemoveLoadoutWeaponsNotAvailableInInventory", ["GameModeInventorySystem"], false, false);
    if (UIPanelLoadout) {
        try {
            const effectiveCost = UIPanelLoadout.method("GetEffectiveLoadoutCost", 1)
                .overload("DLAR_WeaponBase");
            installHook(effectiveCost, "UIPanelLoadout.GetEffectiveLoadoutCost unlock", function (weapon) {
                if (mods.unlockAll)
                    return 0;
                return Number(effectiveCost.invokeRaw(this, weapon));
            });
        }
        catch (error) {
            console.error("[" + MENU_NAME + "] Skipped unlock hook UIPanelLoadout.GetEffectiveLoadoutCost: " + error);
        }
    }
    installUnlockBooleanHook(UIPanelWeaponSkins, "get_HideUnavailableAppearanceItems", [], false, false);
    installUnlockBooleanHook(UIPanelWeaponSkins, "ShouldShowSkinInScroller", ["WeaponSkin"], true, false);
    installUnlockBooleanHook(UIPanelWeaponSkins, "ShouldShowWrapInScroller", ["WeaponSkin", "WeaponWrapScriptable"], true, false);
    installUnlockBooleanHook(UIPanelWeaponSkins, "IsSkinUnlockedForUI", ["WeaponSkin"], true, false);
    installUnlockBooleanHook(UIPanelWeaponSkins, "IsWrapUnlockedForUI", ["WeaponWrapScriptable"], true, false);
    installUnlockBooleanHook(UIPanelWeaponSkins, "IsWrapAppearanceUnlockedForUI", ["WeaponSkin", "WeaponWrapScriptable"], true, false);
    installUnlockBooleanHook(UIPanelWeaponSkins, "IsCharmUnlockedForUI", ["Weapons.Charms.WeaponCharm"], true, false);
    installUnlockBooleanHook(WeaponSkins, "IsStoreUnlockedContract", ["SkinContractScriptable"], true, true);
    installAppearanceAvailabilityHook("IsSkinAvailable", "WeaponSkin");
    installAppearanceAvailabilityHook("IsWrapAvailable", "WeaponWrapScriptable");
    installUnlockBooleanHook(UITechNode, "IsLockedInBackend", [], false, false);
    installUnlockBooleanHook(UITechNode, "IsAllParentsUnlocked", [], true, false);
    installUnlockBooleanHook(TechNodeWeaponWrap, "IsContractUnlocked", [], true, false);
    installUnlockOnEnableRefresh(UITouchWeaponSelection, ["ResetLockStatus"]);
    // Ownership is supplied by get_IsOwned; do not invoke the row's Unlock
    // interaction callback while its panel is being constructed.
    installUnlockOnEnableRefresh(UITouchCosmeticSelection, []);
    installUnlockOnEnableRefresh(UIPanelWeaponSkins, ["RefreshHiddenAppearanceRows", "RefreshUnlocks", "RefreshCharmUnlocks"], setSkinPanelShowLocked);
    installUnlockOnEnableRefresh(PlayerCosmeticsLockerPanel, ["RefreshActiveSlots"], setUnlockCatalogTesting);
    installUnlockOnEnableRefresh(UIPanelLoadout, [], panel => {
        expandUnlockWeaponCatalog();
        setLoadoutShowAll(panel);
    });
    installUnlockOnEnableRefresh(TechNodeWeaponWrap, ["RefreshSecondaryLock"]);
    if (UIPanelLoadout) {
        try {
            const loadWeapons = UIPanelLoadout.method("LoadWeapons", 0);
            installHook(loadWeapons, "UIPanelLoadout.LoadWeapons unlock filter", function () {
                if (mods.unlockAll) {
                    expandUnlockWeaponCatalog();
                    setLoadoutShowAll(this);
                }
                loadWeapons.invokeRaw(this);
            });
        }
        catch (_) { }
    }
    if (WeaponsManager) {
        try {
            const legitimate = WeaponsManager.method("IsLoadoutWeaponLegitimate", 1)
                .overload("DLAR_WeaponBase");
            if (legitimate.returnType.name === "System.Boolean" &&
                !legitimate.virtualAddress.isNull()) {
                installHook(legitimate, "WeaponsManager.IsLoadoutWeaponLegitimate local unlock", function (weapon) {
                    const accepted = !!legitimate.invokeRaw(this, weapon);
                    if (accepted || !mods.unlockAll || !isUnityObjectAlive(weapon))
                        return accepted;
                    let localManager = legitimate.isStatic;
                    if (!localManager) {
                        try {
                            const instance = WeaponsManager.method("get_Instance", 0).invoke();
                            localManager = sameObject(this, instance);
                        }
                        catch (_) {
                            localManager = componentIsActiveInScene(this);
                        }
                    }
                    if (!localManager)
                        return false;
                    // Privileged tools (Clipboard_Dev, Clipboard_Mod and
                    // Megaphone) intentionally do not use the same settings
                    // object as ordinary guns. Requiring weaponSettings here
                    // made them visible but impossible to place in a slot.
                    return WeaponBase.isAssignableFrom(weapon.class);
                });
            }
        }
        catch (error) {
            console.error("[" + MENU_NAME + "] Loadout validator hook unavailable: " + error);
        }
    }
    if (NetworkPlayer) {
        try {
            const applyDamage = NetworkPlayer.method("ApplyDamage", 3)
                .overload("System.Int32", "DLAR_WeaponBase", "UnityEngine.Vector3");
            installHook(applyDamage, "DLARX_NetworkPlayer.ApplyDamage invincibility", function (damage, weapon, hitPosition) {
                if (mods.invincibility && networkObjectHasInputAuthority(this))
                    damage = 0;
                return applyDamage.invokeRaw(this, damage, weapon, hitPosition);
            });
        }
        catch (error) {
            console.error("[" + MENU_NAME + "] ApplyDamage invincibility hook unavailable: " + error);
        }
        try {
            const applyDamageToVitals = NetworkPlayer.method("ApplyDamageToVitals", 1)
                .overload("System.Int32");
            installHook(applyDamageToVitals, "DLARX_NetworkPlayer.ApplyDamageToVitals invincibility", function (damage) {
                if (mods.invincibility && networkObjectHasInputAuthority(this))
                    damage = 0;
                return applyDamageToVitals.invokeRaw(this, damage);
            });
        }
        catch (error) {
            console.error("[" + MENU_NAME + "] ApplyDamageToVitals invincibility hook unavailable: " + error);
        }
        try {
            const rpcApplyDamage = NetworkPlayer.method("RPC_ApplyDamage", 9)
                .overload(
                    "System.Int32",
                    "System.String",
                    "System.Int32",
                    "DLARX_NetworkPlayer",
                    "System.Boolean",
                    "System.Boolean",
                    "UnityEngine.Vector3",
                    "System.Single",
                    "System.Boolean");
            installHook(rpcApplyDamage, "DLARX_NetworkPlayer.RPC_ApplyDamage invincibility", function (weaponType, weaponId, damage, attacker, wasCritical, wasHeadshot, hitPosition, force, applyGameModeDamageRules) {
                if (mods.invincibility && networkObjectHasInputAuthority(this))
                    damage = 0;
                rpcApplyDamage.invokeRaw(this, weaponType, weaponId, damage, attacker, wasCritical, wasHeadshot, hitPosition, force, applyGameModeDamageRules);
            });
        }
        catch (error) {
            console.error("[" + MENU_NAME + "] RPC_ApplyDamage invincibility hook unavailable: " + error);
        }
        try {
            const setDeadVitals = NetworkPlayer.method("SetPlayerDeadVitals", 0);
            installHook(setDeadVitals, "DLARX_NetworkPlayer.SetPlayerDeadVitals invincibility", function () {
                if (mods.invincibility && networkObjectHasInputAuthority(this))
                    return;
                setDeadVitals.invokeRaw(this);
            });
        }
        catch (error) {
            console.error("[" + MENU_NAME + "] SetPlayerDeadVitals invincibility hook unavailable: " + error);
        }
    }
    const baseShoot = WeaponBase.method("Shoot", 1);
    installHook(baseShoot, "DLAR_WeaponBase.Shoot", function (spawnNetworkFX) {
        const settings = weaponSettings(this);
        const local = isLocalWeapon(this);
        const gun = local && isGun(this);
        let restoreRate = false;
        let oldRate = 0.0;
        let fired = false;
        if (mods.infiniteAmmo && local)
            topUpWeapon(this);
        if (settings && gun && (mods.noCooldown || mods.rapidFire)) {
            try {
                oldRate = Number(settings.field("FireRateSeconds").value);
                settings.field("FireRateSeconds").value = mods.noCooldown
                    ? 0.0
                    : Math.min(oldRate, RAPID_FIRE_INTERVAL);
                restoreRate = true;
            }
            catch (_) { }
        }
        try {
            fired = !!baseShoot.invokeRaw(this, spawnNetworkFX);
            return fired;
        }
        finally {
            if (restoreRate && settings) {
                try {
                    settings.field("FireRateSeconds").value = oldRate;
                }
                catch (_) { }
            }
            if (mods.infiniteAmmo && local)
                topUpWeapon(this);
            if (mods.removeStreakGun && local && fired)
                attemptRemoveStreakShot();
        }
    });
    const triggerStateUpdate = WeaponBase.method("UpdateOnTriggerstate", 0);
    installHook(triggerStateUpdate, "DLAR_WeaponBase.UpdateOnTriggerstate", function () {
        const settings = weaponSettings(this);
        let restoreAutomatic = false;
        let oldAutomatic = false;
        if (mods.rapidFire && settings && isLocalWeapon(this) && isGun(this)) {
            try {
                oldAutomatic = !!settings.field("isAutomatic").value;
                settings.field("isAutomatic").value = true;
                restoreAutomatic = true;
            }
            catch (_) { }
        }
        try {
            triggerStateUpdate.invokeRaw(this);
        }
        finally {
            if (restoreAutomatic && settings) {
                try {
                    settings.field("isAutomatic").value = oldAutomatic;
                }
                catch (_) { }
            }
        }
    });
    const baseConsumeAmmo = WeaponBase.method("ConsumeAmmo", 1);
    installHook(baseConsumeAmmo, "DLAR_WeaponBase.ConsumeAmmo", function (amount) {
        if (mods.infiniteAmmo && isLocalWeapon(this))
            return;
        baseConsumeAmmo.invokeRaw(this, amount);
    });
    const baseHasAmmo = WeaponBase.method("HasAmmo", 0);
    installHook(baseHasAmmo, "DLAR_WeaponBase.HasAmmo", function () {
        if (mods.infiniteAmmo && isLocalWeapon(this))
            return true;
        return !!baseHasAmmo.invokeRaw(this);
    });
    const storageConsumeAmmo = AmmoStorage.method("ConsumeAmmo", 1);
    installHook(storageConsumeAmmo, "Weapons.WeaponAmmoStorage.ConsumeAmmo", function (bulletsNeeded) {
        if (mods.infiniteAmmo && isLocalAmmoStorage(this))
            return Math.max(0, Math.trunc(Number(bulletsNeeded)));
        return Number(storageConsumeAmmo.invokeRaw(this, bulletsNeeded));
    });
    const storageHasAmmo = AmmoStorage.method("HasAmmo", 0);
    installHook(storageHasAmmo, "Weapons.WeaponAmmoStorage.HasAmmo", function () {
        if (mods.infiniteAmmo && isLocalAmmoStorage(this))
            return true;
        return !!storageHasAmmo.invokeRaw(this);
    });
    const weaponRecoil = RecoilController.method("WeaponRecoil", 0);
    installHook(weaponRecoil, "DLAR_XRHandRecoilController.WeaponRecoil", function () {
        let localWeapon = false;
        try {
            localWeapon = isLocalWeapon(this.field("currentWeapon").value);
        }
        catch (_) { }
        if (mods.noRecoil && localWeapon)
            return;
        weaponRecoil.invokeRaw(this);
    });
    const bulletOffset = HitscanWeapon.method("GetBulletOffsetDirection", 2);
    installHook(bulletOffset, "HitscanWeapon.GetBulletOffsetDirection", function (forward, recoilPercent) {
        const local = isLocalWeapon(this);
        if (mods.aimbot && local) {
            const solution = aimbotDirectionForWeapon(this);
            if (solution) {
                applyAimbotSolution(solution);
                forward = solution.direction;
            }
        }
        if (mods.noRecoil && local)
            return bulletOffset.invokeRaw(this, forward, 0.0);
        return bulletOffset.invokeRaw(this, forward, recoilPercent);
    });
    if (projectileLaunchMethod) {
        installHook(projectileLaunchMethod, "ProjectileWeapon.LaunchProjectile", function (direction, position, spawnTransform) {
            if (mods.aimbot && isLocalWeapon(this)) {
                const solution = aimbotDirectionForWeapon(this);
                if (solution) {
                    applyAimbotSolution(solution);
                    direction = solution.direction;
                }
            }
            projectileLaunchMethod.invokeRaw(this, direction, position, spawnTransform);
        });
    }
    else {
        console.warn("[" + MENU_NAME + "] Skipped projectile aimbot hook: LaunchProjectile is unavailable.");
    }
    const playerLateUpdate = PlayerController.method("LateUpdate", 0);
    installHook(playerLateUpdate, "PlayerController.LateUpdate", function () {
        playerLateUpdate.invokeRaw(this);
        if (!shouldTickPlayerController(this))
            return;
        if (tickInProgress)
            return;
        tickInProgress = true;
        try {
            tick(this);
            lastTickError = "";
            tickErrorCount = 0;
        }
        catch (error) {
            tickErrorCount++;
            const message = String(error?.stack || error);
            if (message !== lastTickError || tickErrorCount % 300 === 0) {
                console.error("[" + MENU_NAME + "] Tick error: " + message);
                lastTickError = message;
            }
        }
        finally {
            tickInProgress = false;
        }
    });
    console.log("[" + MENU_NAME + "] Ready (runtime-validated build). " +
        "Hold left Y to open; touch buttons with the right-hand ball.");
});
