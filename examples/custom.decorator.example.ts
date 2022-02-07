/* eslint-disable no-console */
import { Validator } from '../src';
import { addValidationRule, GenericConstraintChecker } from '../src/core';
import { StringPropertyDecorator } from '../src/decorators';
import { DecoratorProperty, Predicate, ValidationExchange, ValidationMetadata, ValidationOutput, ValidationRule, ValidationRuleOptions } from '../src/interfaces';
import { buildRuleOptions } from '../src/utils';

// Rule implementation
class IsAlphaNumericValidationRule implements ValidationRule<string> {
    static instance = new IsAlphaNumericValidationRule();
    isValid(exchange: ValidationExchange<string>): ValidationOutput {
        // Metada contains the current value from the field and the constraint from the decorator if applies
        const predicate: Predicate<ValidationMetadata<string>> = (metadata: ValidationMetadata<string>): boolean => {
            const re = /^(?=.*?[a-zA-Z])(?=.*?\d)[a-zA-Z0-9]+$/g;
            return re.test(metadata.value);
        };

        // This method validates the expected type, with a predicate evaluation
        return GenericConstraintChecker.check('string', predicate, exchange);
    }
}

// Decorator
const IsAlphaNumeric = (properties?: DecoratorProperty): StringPropertyDecorator => {
    return function (target: unknown, key: string) {
        const rule = IsAlphaNumericValidationRule.instance;
        // general key, is a default message from the loaded bundle, but you can pass a custom message directly
        const ruleOptions: ValidationRuleOptions<string> = buildRuleOptions(rule, 'general', null, properties);

        // Registers the target with the validation rule
        addValidationRule(target, key, ruleOptions);
    };
};

// Usage
class Profile {
    @IsAlphaNumeric()
    username: string;
}

const profile = new Profile();
profile.username = 'tonyStark';

// Validator
const validator = new Validator();
const [isValid, errors] = validator.validate(profile);

if (!isValid) {
    console.error('Errors => ', errors);
}

/**
 * Output
 * Errors => [
 *  {
 *     property: 'username',
 *     messages: [ 'username is an invalid field' ]
 *  }
 */
