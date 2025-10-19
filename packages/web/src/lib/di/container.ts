/**
 * Dependency Injection Container
 * Provides singleton instances of services and use cases
 */

import { db } from '@extractiq/infrastructure';
import {
  DrizzleDocumentRepository,
  DrizzleUserRepository,
  AiExtractorFactory,
  LocalFileStorageService,
  BullMQQueueService,
  BcryptPasswordHasherService,
  JwtTokenService,
  ConsoleNotificationService,
} from '@extractiq/infrastructure';
import { AiExtractorService } from '@extractiq/core';

import {
  UploadDocumentUseCase,
  ProcessDocumentUseCase,
  GetDocumentUseCase,
  ListDocumentsUseCase,
  DeleteDocumentUseCase,
  RegisterUseCase,
  LoginUseCase,
} from '@extractiq/core';

// Singleton instances
let documentRepository: DrizzleDocumentRepository | null = null;
let userRepository: DrizzleUserRepository | null = null;
let aiExtractor: AiExtractorService | null = null;
let fileStorage: LocalFileStorageService | null = null;
let queueService: BullMQQueueService | null = null;
let passwordHasher: BcryptPasswordHasherService | null = null;
let tokenService: JwtTokenService | null = null;
let notificationService: ConsoleNotificationService | null = null;

// Use cases
let uploadDocumentUseCase: UploadDocumentUseCase | null = null;
let processDocumentUseCase: ProcessDocumentUseCase | null = null;
let getDocumentUseCase: GetDocumentUseCase | null = null;
let listDocumentsUseCase: ListDocumentsUseCase | null = null;
let deleteDocumentUseCase: DeleteDocumentUseCase | null = null;
let registerUseCase: RegisterUseCase | null = null;
let loginUseCase: LoginUseCase | null = null;

/**
 * Get Document Repository
 */
export function getDocumentRepository(): DrizzleDocumentRepository {
  if (!documentRepository) {
    documentRepository = new DrizzleDocumentRepository(db);
  }
  return documentRepository;
}

/**
 * Get User Repository
 */
export function getUserRepository(): DrizzleUserRepository {
  if (!userRepository) {
    userRepository = new DrizzleUserRepository(db);
  }
  return userRepository;
}

/**
 * Get AI Extractor Service
 * Uses factory to automatically select provider based on environment
 */
export function getAiExtractor(): AiExtractorService {
  if (!aiExtractor) {
    aiExtractor = AiExtractorFactory.create();
  }
  return aiExtractor;
}

/**
 * Get File Storage Service
 */
export function getFileStorage(): LocalFileStorageService {
  if (!fileStorage) {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    fileStorage = new LocalFileStorageService(uploadDir);
  }
  return fileStorage;
}

/**
 * Get Queue Service
 */
export function getQueueService(): BullMQQueueService {
  if (!queueService) {
    queueService = new BullMQQueueService('document-processing');
  }
  return queueService;
}

/**
 * Get Password Hasher Service
 */
export function getPasswordHasher(): BcryptPasswordHasherService {
  if (!passwordHasher) {
    passwordHasher = new BcryptPasswordHasherService();
  }
  return passwordHasher;
}

/**
 * Get Token Service
 */
export function getTokenService(): JwtTokenService {
  if (!tokenService) {
    tokenService = new JwtTokenService();
  }
  return tokenService;
}

/**
 * Get Notification Service
 */
export function getNotificationService(): ConsoleNotificationService {
  if (!notificationService) {
    notificationService = new ConsoleNotificationService();
  }
  return notificationService;
}

// Use Case Getters

/**
 * Get Upload Document Use Case
 */
export function getUploadDocumentUseCase(): UploadDocumentUseCase {
  if (!uploadDocumentUseCase) {
    uploadDocumentUseCase = new UploadDocumentUseCase(
      getDocumentRepository(),
      getFileStorage(),
      getQueueService()
    );
  }
  return uploadDocumentUseCase;
}

/**
 * Get Process Document Use Case
 */
export function getProcessDocumentUseCase(): ProcessDocumentUseCase {
  if (!processDocumentUseCase) {
    processDocumentUseCase = new ProcessDocumentUseCase(
      getDocumentRepository(),
      getAiExtractor(),
      getNotificationService()
    );
  }
  return processDocumentUseCase;
}

/**
 * Get Document Use Case
 */
export function getGetDocumentUseCase(): GetDocumentUseCase {
  if (!getDocumentUseCase) {
    getDocumentUseCase = new GetDocumentUseCase(getDocumentRepository());
  }
  return getDocumentUseCase;
}

/**
 * Get List Documents Use Case
 */
export function getListDocumentsUseCase(): ListDocumentsUseCase {
  if (!listDocumentsUseCase) {
    listDocumentsUseCase = new ListDocumentsUseCase(getDocumentRepository());
  }
  return listDocumentsUseCase;
}

/**
 * Get Delete Document Use Case
 */
export function getDeleteDocumentUseCase(): DeleteDocumentUseCase {
  if (!deleteDocumentUseCase) {
    deleteDocumentUseCase = new DeleteDocumentUseCase(
      getDocumentRepository(),
      getFileStorage()
    );
  }
  return deleteDocumentUseCase;
}

/**
 * Get Register Use Case
 */
export function getRegisterUseCase(): RegisterUseCase {
  if (!registerUseCase) {
    registerUseCase = new RegisterUseCase(
      getUserRepository(),
      getPasswordHasher(),
      getTokenService()
    );
  }
  return registerUseCase;
}

/**
 * Get Login Use Case
 */
export function getLoginUseCase(): LoginUseCase {
  if (!loginUseCase) {
    loginUseCase = new LoginUseCase(
      getUserRepository(),
      getPasswordHasher(),
      getTokenService()
    );
  }
  return loginUseCase;
}

/**
 * Reset all singletons (useful for testing)
 */
export function resetContainer(): void {
  documentRepository = null;
  userRepository = null;
  aiExtractor = null;
  fileStorage = null;
  queueService = null;
  passwordHasher = null;
  tokenService = null;
  notificationService = null;
  uploadDocumentUseCase = null;
  processDocumentUseCase = null;
  getDocumentUseCase = null;
  listDocumentsUseCase = null;
  deleteDocumentUseCase = null;
  registerUseCase = null;
  loginUseCase = null;
}
