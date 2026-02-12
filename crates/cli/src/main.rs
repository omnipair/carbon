use {
    clap::Parser,
    commands::{Cli, Commands, IdlSource, IdlStandard},
};

pub mod accounts;
pub mod commands;
pub mod events;
pub mod handlers;
pub mod idl;
pub mod instructions;
pub mod legacy_idl;
pub mod project;
pub mod types;
pub mod util;

fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::Parse(options) => match options.idl {
            IdlSource::FilePath(path) => match options.standard {
                IdlStandard::Codama => {
                    handlers::parse_codama(
                        path,
                        options.output,
                        options.as_crate,
                        options.event_hints,
                    )?;
                }
                IdlStandard::Anchor => {
                    if options.event_hints.is_some() {
                        anyhow::bail!(
                            "The '--event-hints' option can only be used with --standard codama."
                        );
                    }
                    handlers::parse(path, options.output, options.as_crate)?;
                }
            },
            IdlSource::ProgramAddress(program_address) => {
                let url = options.url.as_ref().ok_or_else(|| {
                    anyhow::anyhow!(
                        "Network URL (--url / -u) is required when parsing from a program address."
                    )
                })?;

                handlers::process_pda_idl(program_address, url, options.output, options.as_crate)?;
            }
        },
        Commands::Scaffold(options) => {
            handlers::scaffold(
                options.name,
                options.output,
                options.decoders,
                options.data_source,
                options.metrics,
            )?;
        }
    }

    Ok(())
}
