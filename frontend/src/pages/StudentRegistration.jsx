import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { CalendarIcon, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';

// Schema de validação
const studentSchema = z.object({
  // Dados pessoais do aluno
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  sexo: z.enum(['masculino', 'feminino'], { required_error: 'Sexo é obrigatório' }),
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos').max(11, 'CPF deve ter 11 dígitos'),
  rg: z.string().min(1, 'RG é obrigatório'),
  
  // Endereço
  endereco: z.object({
    rua: z.string().min(1, 'Rua é obrigatória'),
    numero: z.string().min(1, 'Número é obrigatório'),
    complemento: z.string().optional(),
    bairro: z.string().min(1, 'Bairro é obrigatório'),
    cidade: z.string().min(1, 'Cidade é obrigatória'),
    estado: z.string().min(2, 'Estado é obrigatório').max(2, 'Estado deve ter 2 caracteres'),
    cep: z.string().min(8, 'CEP deve ter 8 dígitos').max(8, 'CEP deve ter 8 dígitos'),
  }),
  
  // Contato
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  whatsapp: z.string().optional(),
  
  // Responsável (para menores de idade)
  responsavel: z.object({
    nome: z.string().min(1, 'Nome do responsável é obrigatório'),
    cpf: z.string().min(11, 'CPF deve ter 11 dígitos').max(11, 'CPF deve ter 11 dígitos'),
    telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
    email: z.string().email('Email inválido'),
    parentesco: z.string().min(1, 'Parentesco é obrigatório'),
  }),
  
  // Informações de natação
  nivelNatacao: z.enum(['iniciante', 'basico', 'intermediario', 'avancado'], {
    required_error: 'Nível de natação é obrigatório'
  }),
  experienciaAnterior: z.string().optional(),
  objetivos: z.string().optional(),
  
  // Informações médicas
  restricoesMedicas: z.string().optional(),
  medicamentos: z.string().optional(),
  alergias: z.string().optional(),
  contatoEmergencia: z.object({
    nome: z.string().min(1, 'Nome do contato de emergência é obrigatório'),
    telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
    parentesco: z.string().min(1, 'Parentesco é obrigatório'),
  }),
  
  // Termos e consentimentos
  consentimentoImagem: z.boolean().refine(val => val === true, {
    message: 'Consentimento de imagem é obrigatório'
  }),
  aceitaTermos: z.boolean().refine(val => val === true, {
    message: 'Aceitar os termos é obrigatório'
  }),
});

const StudentRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      endereco: {},
      responsavel: {},
      contatoEmergencia: {},
      consentimentoImagem: false,
      aceitaTermos: false,
    },
  });

  // Calcular idade baseada na data de nascimento
  const dataNascimento = watch('dataNascimento');
  const idade = dataNascimento ? 
    Math.floor((new Date() - new Date(dataNascimento)) / (365.25 * 24 * 60 * 60 * 1000)) : 0;

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await api.post('/students', data);
      
      if (response.data.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          navigate('/students');
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao cadastrar aluno:', error);
      setSubmitError(
        error.response?.data?.message || 'Erro ao cadastrar aluno. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-700 mb-2">
                Cadastro Realizado!
              </h2>
              <p className="text-gray-600 mb-4">
                O aluno foi cadastrado com sucesso no sistema.
              </p>
              <p className="text-sm text-gray-500">
                Redirecionando para a lista de alunos...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <UserPlus className="mr-3 h-8 w-8 text-blue-600" />
          Cadastro de Novo Aluno
        </h1>
        <p className="text-gray-600 mt-2">
          Preencha todas as informações necessárias para o cadastro do aluno
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
            <CardDescription>
              Informações básicas do aluno
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  {...register('nome')}
                  placeholder="Nome completo do aluno"
                />
                {errors.nome && (
                  <p className="text-sm text-red-600 mt-1">{errors.nome.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                <Input
                  id="dataNascimento"
                  type="date"
                  {...register('dataNascimento')}
                />
                {errors.dataNascimento && (
                  <p className="text-sm text-red-600 mt-1">{errors.dataNascimento.message}</p>
                )}
                {idade > 0 && (
                  <p className="text-sm text-gray-500 mt-1">Idade: {idade} anos</p>
                )}
              </div>

              <div>
                <Label htmlFor="sexo">Sexo *</Label>
                <Select onValueChange={(value) => setValue('sexo', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                  </SelectContent>
                </Select>
                {errors.sexo && (
                  <p className="text-sm text-red-600 mt-1">{errors.sexo.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  {...register('cpf')}
                  placeholder="00000000000"
                  maxLength={11}
                />
                {errors.cpf && (
                  <p className="text-sm text-red-600 mt-1">{errors.cpf.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="rg">RG *</Label>
                <Input
                  id="rg"
                  {...register('rg')}
                  placeholder="Número do RG"
                />
                {errors.rg && (
                  <p className="text-sm text-red-600 mt-1">{errors.rg.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
            <CardDescription>
              Endereço residencial do aluno
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="endereco.rua">Rua *</Label>
                <Input
                  id="endereco.rua"
                  {...register('endereco.rua')}
                  placeholder="Nome da rua"
                />
                {errors.endereco?.rua && (
                  <p className="text-sm text-red-600 mt-1">{errors.endereco.rua.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="endereco.numero">Número *</Label>
                <Input
                  id="endereco.numero"
                  {...register('endereco.numero')}
                  placeholder="123"
                />
                {errors.endereco?.numero && (
                  <p className="text-sm text-red-600 mt-1">{errors.endereco.numero.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="endereco.complemento">Complemento</Label>
                <Input
                  id="endereco.complemento"
                  {...register('endereco.complemento')}
                  placeholder="Apto, casa, etc."
                />
              </div>

              <div>
                <Label htmlFor="endereco.bairro">Bairro *</Label>
                <Input
                  id="endereco.bairro"
                  {...register('endereco.bairro')}
                  placeholder="Nome do bairro"
                />
                {errors.endereco?.bairro && (
                  <p className="text-sm text-red-600 mt-1">{errors.endereco.bairro.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="endereco.cidade">Cidade *</Label>
                <Input
                  id="endereco.cidade"
                  {...register('endereco.cidade')}
                  placeholder="Nome da cidade"
                />
                {errors.endereco?.cidade && (
                  <p className="text-sm text-red-600 mt-1">{errors.endereco.cidade.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="endereco.estado">Estado *</Label>
                <Input
                  id="endereco.estado"
                  {...register('endereco.estado')}
                  placeholder="SP"
                  maxLength={2}
                />
                {errors.endereco?.estado && (
                  <p className="text-sm text-red-600 mt-1">{errors.endereco.estado.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="endereco.cep">CEP *</Label>
                <Input
                  id="endereco.cep"
                  {...register('endereco.cep')}
                  placeholder="00000000"
                  maxLength={8}
                />
                {errors.endereco?.cep && (
                  <p className="text-sm text-red-600 mt-1">{errors.endereco.cep.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardHeader>
            <CardTitle>Informações de Contato</CardTitle>
            <CardDescription>
              Dados para comunicação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="email@exemplo.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  {...register('telefone')}
                  placeholder="(11) 99999-9999"
                />
                {errors.telefone && (
                  <p className="text-sm text-red-600 mt-1">{errors.telefone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  {...register('whatsapp')}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsável (se menor de idade) */}
        {idade < 18 && (
          <Card>
            <CardHeader>
              <CardTitle>Dados do Responsável</CardTitle>
              <CardDescription>
                Informações do responsável legal (obrigatório para menores de 18 anos)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="responsavel.nome">Nome do Responsável *</Label>
                  <Input
                    id="responsavel.nome"
                    {...register('responsavel.nome')}
                    placeholder="Nome completo do responsável"
                  />
                  {errors.responsavel?.nome && (
                    <p className="text-sm text-red-600 mt-1">{errors.responsavel.nome.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="responsavel.cpf">CPF do Responsável *</Label>
                  <Input
                    id="responsavel.cpf"
                    {...register('responsavel.cpf')}
                    placeholder="00000000000"
                    maxLength={11}
                  />
                  {errors.responsavel?.cpf && (
                    <p className="text-sm text-red-600 mt-1">{errors.responsavel.cpf.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="responsavel.telefone">Telefone do Responsável *</Label>
                  <Input
                    id="responsavel.telefone"
                    {...register('responsavel.telefone')}
                    placeholder="(11) 99999-9999"
                  />
                  {errors.responsavel?.telefone && (
                    <p className="text-sm text-red-600 mt-1">{errors.responsavel.telefone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="responsavel.email">Email do Responsável *</Label>
                  <Input
                    id="responsavel.email"
                    type="email"
                    {...register('responsavel.email')}
                    placeholder="email@exemplo.com"
                  />
                  {errors.responsavel?.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.responsavel.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="responsavel.parentesco">Parentesco *</Label>
                  <Select onValueChange={(value) => setValue('responsavel.parentesco', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o parentesco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pai">Pai</SelectItem>
                      <SelectItem value="mae">Mãe</SelectItem>
                      <SelectItem value="avo">Avô/Avó</SelectItem>
                      <SelectItem value="tio">Tio/Tia</SelectItem>
                      <SelectItem value="responsavel_legal">Responsável Legal</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.responsavel?.parentesco && (
                    <p className="text-sm text-red-600 mt-1">{errors.responsavel.parentesco.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações de Natação */}
        <Card>
          <CardHeader>
            <CardTitle>Informações de Natação</CardTitle>
            <CardDescription>
              Experiência e objetivos na natação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nivelNatacao">Nível de Natação *</Label>
              <Select onValueChange={(value) => setValue('nivelNatacao', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iniciante">Iniciante (nunca nadou)</SelectItem>
                  <SelectItem value="basico">Básico (sabe boiar/flutuar)</SelectItem>
                  <SelectItem value="intermediario">Intermediário (nada alguns estilos)</SelectItem>
                  <SelectItem value="avancado">Avançado (domina todos os estilos)</SelectItem>
                </SelectContent>
              </Select>
              {errors.nivelNatacao && (
                <p className="text-sm text-red-600 mt-1">{errors.nivelNatacao.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="experienciaAnterior">Experiência Anterior</Label>
              <Textarea
                id="experienciaAnterior"
                {...register('experienciaAnterior')}
                placeholder="Descreva experiências anteriores com natação, outras escolas, competições, etc."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="objetivos">Objetivos</Label>
              <Textarea
                id="objetivos"
                {...register('objetivos')}
                placeholder="Quais são os objetivos com as aulas de natação? (condicionamento, lazer, competição, etc.)"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações Médicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Médicas</CardTitle>
            <CardDescription>
              Informações importantes para a segurança do aluno
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="restricoesMedicas">Restrições Médicas</Label>
              <Textarea
                id="restricoesMedicas"
                {...register('restricoesMedicas')}
                placeholder="Descreva qualquer restrição médica, lesões, cirurgias recentes, etc."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="medicamentos">Medicamentos em Uso</Label>
              <Textarea
                id="medicamentos"
                {...register('medicamentos')}
                placeholder="Liste medicamentos que o aluno faz uso regularmente"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="alergias">Alergias</Label>
              <Textarea
                id="alergias"
                {...register('alergias')}
                placeholder="Descreva alergias conhecidas (medicamentos, alimentos, produtos químicos, etc.)"
                rows={2}
              />
            </div>

            {/* Contato de Emergência */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Contato de Emergência</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="contatoEmergencia.nome">Nome *</Label>
                  <Input
                    id="contatoEmergencia.nome"
                    {...register('contatoEmergencia.nome')}
                    placeholder="Nome completo"
                  />
                  {errors.contatoEmergencia?.nome && (
                    <p className="text-sm text-red-600 mt-1">{errors.contatoEmergencia.nome.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contatoEmergencia.telefone">Telefone *</Label>
                  <Input
                    id="contatoEmergencia.telefone"
                    {...register('contatoEmergencia.telefone')}
                    placeholder="(11) 99999-9999"
                  />
                  {errors.contatoEmergencia?.telefone && (
                    <p className="text-sm text-red-600 mt-1">{errors.contatoEmergencia.telefone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contatoEmergencia.parentesco">Parentesco *</Label>
                  <Input
                    id="contatoEmergencia.parentesco"
                    {...register('contatoEmergencia.parentesco')}
                    placeholder="Ex: Pai, Mãe, Irmão"
                  />
                  {errors.contatoEmergencia?.parentesco && (
                    <p className="text-sm text-red-600 mt-1">{errors.contatoEmergencia.parentesco.message}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Termos e Consentimentos */}
        <Card>
          <CardHeader>
            <CardTitle>Termos e Consentimentos</CardTitle>
            <CardDescription>
              Aceite dos termos e consentimentos necessários
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="consentimentoImagem"
                {...register('consentimentoImagem')}
                onCheckedChange={(checked) => setValue('consentimentoImagem', checked)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="consentimentoImagem"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Consentimento de Uso de Imagem *
                </Label>
                <p className="text-xs text-muted-foreground">
                  Autorizo o uso da imagem do aluno para fins de divulgação da escola de natação em materiais promocionais, site e redes sociais.
                </p>
              </div>
            </div>
            {errors.consentimentoImagem && (
              <p className="text-sm text-red-600">{errors.consentimentoImagem.message}</p>
            )}

            <div className="flex items-start space-x-3">
              <Checkbox
                id="aceitaTermos"
                {...register('aceitaTermos')}
                onCheckedChange={(checked) => setValue('aceitaTermos', checked)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="aceitaTermos"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Aceito os Termos de Uso e Política de Privacidade *
                </Label>
                <p className="text-xs text-muted-foreground">
                  Li e concordo com os termos de uso da escola de natação, incluindo regras de conduta, política de cancelamento e responsabilidades.
                </p>
              </div>
            </div>
            {errors.aceitaTermos && (
              <p className="text-sm text-red-600">{errors.aceitaTermos.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Erro de submissão */}
        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Botões de ação */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/students')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Cadastrando...
              </>
            ) : (
              'Cadastrar Aluno'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StudentRegistration;

