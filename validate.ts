import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Injectable } from '@angular/core';

@Injectable()
export class Validate {
/**
   * loading
   *
   * @public
   * @type {Boolean}
   */
  public loading = false;

  /**
   * fBuilder
   *
   * @public
   * @type {FormBuilder}
   */
  public fBuilder: FormBuilder = new FormBuilder();

  /**
   * __customRules
   *
   * @private
   * @type {Array<string>}
   */
  private __customRules: Array<string> = [ 'valid_email', 'matches', 'valid_facebook' ];

  /**
   * __controllers
   *
   * @private
   * @type {Object}
   */
  private __controllers = new Object();

  /**
   * error_messages
   *
   * @public
   * @type {Object}
   */
  public error_messages = {
    required       : 'Esse campo é obrigatório',
    minlength      : 'Campo muito curto',
    matches        : 'Esse campo precisa ser igual ao outro',
    valid_email    : 'O e-mail digitado não é válido',
    maxlength      : 'Valor maior que o permitido',
    valid_facebook : 'A url do facebook está incorreta'
  };

  /**
   * submited
   *
   * @public
   * @type {Boolean}
   */
  public submited = false;

  /**
   * valid_facebook
   *
   * regra de validacao do facebook
   *
   * @private
   * @author Gustavo Vilas Boas
   * @since 02-2017
   * @param {FormControl} control FormControl do angular
   */
  public valid_facebook( control: FormControl ) {

    // verifica se existe um valor
    if ( control.value ) {

      // regex
      const regex = /^(https?:\/\/)?((w{3}\.)?)facebook.com\/.*/i;

      // se der match
      if ( control.value.match( regex ) ) {
        return null;
      } else return { valid_facebook: true };
    } else return null;
  }

  /**
   * valid_email
   *
   * regra para validacao de email
   *
   * @private
   * @author Gustavo Vilas Boas
   * @since 02-2017
   * @param {FormControl} control FormControl do angular
   */
  public valid_email( control: FormControl ) {

    // verificia se existe um valor
    if ( control.value ) {

      // regex
      const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

      // se der match
      if ( control.value.match( regex ) ) {
        return null;
      } else return { valid_email: true };
    } else return null;
  }

  /**
   * matches
   *
   * verifica se o valor de um campo é igual o outro
   *
   * @private
   * @author Gustavo Vilas Boas
   * @since 02-2017
   * @param {FormControl} control FormControl do angular
   */
  public matches( field: string ) {
    return ( control: FormControl ) => {

      // verifica se existe um valor
      if ( control.value ) {

        // check if there is a value
        if ( this.item( field ) ) {

          // verifica se os valores sao iguais
          if ( this.item( field ).valueOf() !== control.value.valueOf()  ) {
            return { matches : true };
          } else return null;
        } else return null;
      } else return null;
    };
  }

  /**
   * set_form
   *
   * cria um novo form group com o form builder
   *
   * @public
   * @author Gustavo Vilas Boas
   * @since 02-2017
   * @param {Array<Object>} rules all rules
   */
  public set_form( rules: Array<Object> ) {
    return this.fBuilder.group( this.__setRules( rules ) );
  }

  /**
   * item
   *
   * retorna o valor de um item especifico do formulário
   *
   * @public
   * @author Gustavo Vilas Boas
   * @since 02-2017
   * @param {string} key nome do item do formulário
   */
  public item( key: string ) {
    return ( this.__controllers[ key ] ) ? this.__controllers[ key ].value : null;
  }

  /**
   * control
   *
   * retorna um controller especifico do formulario
   *
   * @public
   * @author Gustavo Vilas Boas
   * @since 02-2017
   * @param {string} key nome do item do formulário
   */
  public control( key: string ) {
    return ( this.__controllers[ key ] ) ? this.__controllers[ key ] : null;
  }

  /**
   * errors
   *
   * retorna os erros existentes em um campo
   *
   * @public
   * @author Gustavo Vilas Boas
   * @since 02-2017
   * @param {string} key nome do item do formulário
   */
  public errors( key: string, optional_messages: Object = new Object() ): boolean|Array<string> {

    // pega o controlador
    const fControl = this.__controllers[ key ];

    // se ele existir
    if ( fControl ) {

      // verifica se existem errors
      if ( fControl.errors && fControl.invalid && fControl.dirty && fControl.touched ) {

        // seta o array de retorno
        const retorno = new Array();

        // percorre todos os erros
        for ( const e in fControl.errors ) {
          let msg = ( this.error_messages[ e ] ) ? this.error_messages[ e ] : `Nenhuma mensagem encontrada para o erro ${e}`;
          msg     = ( optional_messages[ e ] ) ? optional_messages[ e ] : msg;
          retorno.push( msg );
        }

        // volta as mensagens
        return retorno;
      } else return false;
    } else return false;
  }

  /**
   * __getValidatorsArray
   *
   * seta uma array de validadores customizados
   *
   * @private
   * @author Gustavo Vilas Boas
   * @since 02-2017
   * @param {string} rules all rules
   */
  private __getValidatorsArray( rules: string, field: string ) {

    // verifica se existem regras
    if ( !rules ) return new Array();

    // separa as regras de validação
    const rulesArray = rules.split( '|' );

    // declara o array de retorno
    const retorno = new Array();

    // percorre todas as regras
    for ( const r in rulesArray ) {

      // verifica se existe []
      if ( rulesArray[r].indexOf( '[' ) !== -1 && rulesArray[r].indexOf( ']' ) !== -1  ) {

        // separa a string
        const parts = rulesArray[r].split(/[[\]]{1,2}/);
        parts.length--;

        if ( this.__customRules.indexOf( parts[0] ) === -1 ) {

          // adiciona o validador
          retorno.push( Validators[ parts[0] ]( parts[1] ) );
        } else {

          // adiciona o validador customizado
          retorno.push( this[ parts[0] ]( parts[1] ) );
        }
      } else {

        // verifica se é uma regra customizada
        if ( this.__customRules.indexOf( rulesArray[r] ) !== -1 ) {

          // adiciona o validador customizado
          retorno.push( this[ rulesArray[r] ] );
        } else {

          // adiciona o validador
          retorno.push( Validators[ rulesArray[r] ] );
        }
      }
    }

    // retorna as regras
    return retorno;
  }

  /**
   * set_rules
   *
   * seta as regras para o formulário atual
   *
   * @public
   * @author Gustavo Vilas Boas
   * @since 02-2017
   * @param {Array<Object>} rules all rules
   */
  private __setRules( rules: Array<Object> ) {

    // objeto que contera os forms controller
    const formControlObject = new Object;

    // percorre todas as regras
    for ( const r in rules ) {

      // seta a regra atual
      const rule = rules[r];

      // pega o array de validadores
      const validatorsArray = this.__getValidatorsArray( rule['rules'], rule['field'] );

      // adiciona um novo FormControl
      formControlObject[ rule['field'] ] = new FormControl( null, validatorsArray );

      // seta os controladores
      this.__controllers = formControlObject;
    }

    // retorna o objeto de formControl
    return formControlObject;
  }
}
