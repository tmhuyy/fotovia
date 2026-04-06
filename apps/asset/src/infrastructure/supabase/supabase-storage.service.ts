import {
    Inject,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '@repo/common';

@Injectable()
export class SupabaseStorageService {
    constructor(
        @Inject(SUPABASE_CLIENT)
        private readonly supabase: SupabaseClient,
        private readonly configService: ConfigService,
    ) {}

    async createSignedUploadUrl(bucket: string, objectKey: string) {
        const { data, error } = await this.supabase.storage
            .from(bucket)
            .createSignedUploadUrl(objectKey);

        if (error) {
            throw new InternalServerErrorException(error.message);
        }

        return data;
    }

    getPublicUrl(bucket: string, objectKey: string) {
        const { data } = this.supabase.storage
            .from(bucket)
            .getPublicUrl(objectKey);

        return data.publicUrl;
    }

    async createSignedReadUrl(
        bucket: string,
        objectKey: string,
        expiresIn?: number,
    ) {
        const ttl =
            expiresIn ??
            Number(
                this.configService.get<string>(
                    'ASSET_SIGNED_READ_URL_EXPIRES_IN',
                ) ?? '3600',
            );

        const { data, error } = await this.supabase.storage
            .from(bucket)
            .createSignedUrl(objectKey, ttl);

        if (error) {
            throw new InternalServerErrorException(error.message);
        }

        return data.signedUrl;
    }

    async deleteObject(bucket: string, objectKey: string) {
        const { error } = await this.supabase.storage
            .from(bucket)
            .remove([objectKey]);

        if (error) {
            throw new InternalServerErrorException(error.message);
        }

        return { deleted: true };
    }
}
