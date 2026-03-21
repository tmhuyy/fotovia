import { Global, Module } from '@nestjs/common';
import { SupabaseProvider } from './supabase.provider';
import { SupabaseStorageService } from './supabase-storage.service';
// import { SupabaseStorageService } from './supabase-storage.service';

@Global()
@Module({
    providers: [SupabaseProvider, SupabaseStorageService],
    exports: [SupabaseProvider, SupabaseStorageService],
})
export class SupabaseModule {}
