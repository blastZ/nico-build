declare namespace PM2 {
  export interface StartOptions {
    name?: string;
    script?: string;
    args?: string | string[];
    interpreter_args?: string | string[];
    cwd?: string;
    out_file?: string;
    error_file?: string;
    log_date_format?: string;
    pid_file?: string;
    min_uptime?: number;
    max_restarts?: number;
    max_memory_restart?: number | string;
    wait_ready?: boolean;
    kill_timeout?: number;
    restart_delay?: number;
    interpreter?: string;
    exec_mode?: string;
    instances?: number | string;
    merge_logs?: boolean;
    watch?: boolean | string[];
    force?: boolean;
    ignore_watch?: string[];
    cron?: any;
    execute_command?: any;
    write?: any;
    source_map_support?: any;
    disable_source_map_support?: any;
    env?: { [key: string]: string };
  }
}
