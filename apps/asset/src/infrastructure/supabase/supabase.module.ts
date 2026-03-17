import { Global, Module } from '@nestjs/common';
import { SupabaseProvider } from './supabase.provider';
// import { SupabaseStorageService } from './supabase-storage.service';

@Global()
@Module({
    providers: [SupabaseProvider],
    exports: [SupabaseProvider],
})
export class SupabaseModule {}
