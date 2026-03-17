import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '@repo/common';

export const SupabaseProvider: Provider = {
    provide: SUPABASE_CLIENT,
    inject: [ConfigService],
    useFactory: (configService: ConfigService): SupabaseClient => {
        const supabaseUrl = configService.get<string>('SUPABASE_URL');
        const serviceRoleKey = configService.get<string>(
            'SUPABASE_SERVICE_ROLE_KEY',
        );

        if (!supabaseUrl) {
            throw new Error('Missing SUPABASE_URL');
        }

        if (!serviceRoleKey) {
            throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
        }

        return createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    },
};
