'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Tabela `pessoas`: Armazena dados pessoais básicos.
     * Não possui chaves estrangeiras, sendo uma das primeiras a ser criada.
     */
    await queryInterface.createTable('pessoas', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      nome: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      sobrenome: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      is_ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      nacionalidade: {
        type: Sequelize.STRING(3),
        allowNull: false,
      },
      dt_nascimento: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      cpf: {
        type: Sequelize.STRING(11),
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING(60),
        allowNull: false,
        unique: true,
      },
      telefone: {
        type: Sequelize.STRING(12),
        allowNull: true,
      }
    });

    /**
     * Tabela `usuarios`: Contém informações de login e perfil, vinculadas a uma pessoa.
     * Depende de `pessoas`.
     */
    await queryInterface.createTable('usuarios', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      pessoa_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'pessoas',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      nickname: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      senha: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      ultima_altera_senha: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      ultimo_login: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      dt_criacao: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });
    
    /**
     * Tabela `equipes`: Armazena informações sobre as equipes.
     * Não possui dependências diretas de outras tabelas.
     */
    await queryInterface.createTable('equipes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      nome: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      data_criacao: { // Nome corrigido para snake_case
        type: Sequelize.DATE,
        allowNull: false,
      }
    });

    /**
     * Tabela `membros_equipe`: Tabela de junção para o relacionamento N:M entre `usuarios` e `equipes`.
     * Depende de `usuarios` e `equipes`.
     */
    await queryInterface.createTable('membros_equipe', {
      equipe_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true, // Chave primária composta
        references: {
          model: 'equipes',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      usuario_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true, // Chave primária composta
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      funcao: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      is_lider: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_titular: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      is_ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      dt_convite: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      dt_aceito: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      dt_saida: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    /**
     * Tabela `jogos`: Armazena os jogos disponíveis para os torneios.
     * Não possui dependências.
     */
    await queryInterface.createTable('jogos', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        nome: {
            type: Sequelize.STRING(40),
            allowNull: false,
            unique: true,
        },
        class_indicativa: {
            type: Sequelize.STRING(3),
            allowNull: false,
        },
        estudio: {
            type: Sequelize.STRING(20),
            allowNull: false,
        }
    });

    /**
     * Tabela `torneios`: Entidade central que organiza os eventos.
     * Depende de `jogos` e `usuarios` (para o responsável).
     */
    await queryInterface.createTable('torneios', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        jogo_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
                model: 'jogos',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
        },
        usuario_responsavel_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
                model: 'usuarios',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
        },
        nome: {
            type: Sequelize.STRING(30),
            allowNull: false,
        },
        descricao: {
            type: Sequelize.STRING(200),
            allowNull: false,
        },
        dt_inicio: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        dt_fim: {
            type: Sequelize.DATE,
            allowNull: true,
        }
    });

    /**
     * Tabela `configs_inscricao`: Configurações de inscrição para um torneio.
     * Depende de `torneios`.
     */
    await queryInterface.createTable('configs_inscricao', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      torneio_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'torneios',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      dt_inicio: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      dt_fim: {
        type: Sequelize.DATE,
        allowNull: false
      },
      qtd_participantes_max: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      modo_inscricao: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'INDIVIDUAL'
      }
    });

    /**
     * Tabela `etapas_partida`: Define as etapas ou fases de um torneio (ex: fase de grupos, oitavas).
     * Depende de `torneios`.
     */
    await queryInterface.createTable('etapas_partida', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4
      },
      torneio_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'torneios',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      ordem: {
        type: Sequelize.SMALLINT,
        allowNull: false,
      },
      tipo_etapa: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      is_concluida: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    });

    /**
     * Tabela `participantes`: Registra quem (usuário ou equipe) está participando de um torneio.
     * Depende de `torneios`, `usuarios` e `equipes`.
     */
    await queryInterface.createTable('participantes', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        torneio_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
                model: 'torneios',
                key: 'id'
            },
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        },
        usuario_id: {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'usuarios',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        },
        equipe_id: {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'equipes',
                key: 'id'
            },
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        },
        dt_inscricao: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        dt_confirmacao: {
            type: Sequelize.DATE,
            allowNull: true
        },
        status: {
            type: Sequelize.STRING(10),
            defaultValue: 'PENDENTE',
            allowNull: false
        }
    });

    /**
     * Tabela `partidas`: Define uma rodada ou conjunto de jogos dentro de uma etapa.
     * Depende de `etapas_partida`.
     */
    await queryInterface.createTable('partidas', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      etapa_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'etapas_partida',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      dt_inicio: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      dt_fim: {
        type: Sequelize.DATE,
        allowNull: true
      },
      situacao: {
        type: Sequelize.STRING(15),
        allowNull: false,
        defaultValue: 'NÃO INICIADO'
      }
    });

    /**
     * Tabela `chaveamentos`: Detalha um confronto específico (jogo) entre participantes dentro de uma partida.
     * Depende de `partidas` e `participantes`.
     */
    await queryInterface.createTable('chaveamentos', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        participante_a_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
                model: 'participantes',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        },
        participante_b_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
                model: 'participantes',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        },
        vencedor_id: {
            type: Sequelize.UUID,
            allowNull: true, // Vencedor é nulo até o fim da partida
            references: {
                model: 'participantes',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        },
        partida_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
                model: 'partidas',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        },
        ordem: {
            type: Sequelize.SMALLINT,
            allowNull: false,
        },
        placar_a: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        placar_b: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        criterio_desempate: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        is_a_pronto: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        is_b_pronto: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });

    /**
     * Tabela `logs_partida`: Registra eventos e ações ocorridos durante uma partida.
     * Depende de `partidas` e `usuarios`.
     */
    await queryInterface.createTable('logs_partida', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        usuario_origem_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
                model: 'usuarios',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        },
        usuario_destino_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
                model: 'usuarios',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        },
        partida_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
                model: 'partidas',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        },
        acao: {
            type: Sequelize.STRING(20),
            allowNull: false
        },
        motivo: {
            type: Sequelize.STRING(20), // Corrigido para STRING(200) para mais detalhes
            allowNull: true
        },
        dt_log: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
    });

    /**
     * Tabela `saldo_pontos`: Armazena a pontuação de um usuário em um determinado jogo.
     * Depende de `usuarios` e `jogos`.
     */
    await queryInterface.createTable('saldo_pontos', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        usuario_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
                model: 'usuarios',
                key: 'id'
            },
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        },
        jogo_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
                model: 'jogos',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        },
        pontos: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        }
    });
  },

  async down(queryInterface, Sequelize) {
    // A ordem de remoção é o inverso da criação para evitar erros de constraint
    await queryInterface.dropTable('saldo_pontos');
    await queryInterface.dropTable('logs_partida');
    await queryInterface.dropTable('chaveamentos');
    await queryInterface.dropTable('partidas');
    await queryInterface.dropTable('participantes');
    await queryInterface.dropTable('etapas_partida');
    await queryInterface.dropTable('configs_inscricao');
    await queryInterface.dropTable('torneios');
    await queryInterface.dropTable('jogos');
    await queryInterface.dropTable('membros_equipe');
    await queryInterface.dropTable('equipes');
    await queryInterface.dropTable('usuarios');
    await queryInterface.dropTable('pessoas');
  }
};