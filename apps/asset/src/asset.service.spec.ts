import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AssetService } from './asset.service';
import { AssetUploadSession } from './entities/asset-upload-session.entity';
import { AssetUsage } from './entities/asset-usage.entity';
import { Asset } from './entities/asset.entity';
import { SupabaseStorageService } from './infrastructure/supabase/supabase-storage.service';

const createRepositoryMock = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => value),
});

describe('AssetService', () => {
    let service: AssetService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AssetService,
                {
                    provide: getRepositoryToken(Asset),
                    useValue: createRepositoryMock(),
                },
                {
                    provide: getRepositoryToken(AssetUploadSession),
                    useValue: createRepositoryMock(),
                },
                {
                    provide: getRepositoryToken(AssetUsage),
                    useValue: createRepositoryMock(),
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn(),
                        getOrThrow: jest.fn(),
                    },
                },
                {
                    provide: SupabaseStorageService,
                    useValue: {
                        createSignedUploadUrl: jest.fn(),
                        getPublicUrl: jest.fn(),
                        createSignedReadUrl: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<AssetService>(AssetService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
