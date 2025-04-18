import type { $Member } from '@/models/member';
import type { $MemberActiveExternal } from '@/models/member/active/external';
import type { $MemberActiveInternal } from '@/models/member/active/internal';
import type { DatabaseResult } from '@/types/database';
import type { BuildModelResult, Model, ModelBuilder, ModelBuilderInternal, ModelBuilderType, ModelGenerator, ModelInstances, ModelMetadata, ModelMode, ModelNormalizer, ModelRawData4build, ModelResolver, ModelSchemaRawOf, ModelUnwrappedInstances__DO_NOT_EXPOSE, ModeWithResolved } from '@/types/model';
import type { ArrayElem, Nullable, Override } from '@/types/utils';
import type {
  Prisma,
  PrismaClient,
  MemberActive as SchemaRaw,
} from '@prisma/client';
import { MemberId } from '@/models/member';
import { Database } from '@/services/database.server';
import { type MemberDetailActive, toMemberDetailActive } from '@/utils/member';
import { buildRawData, fillPrismaSkip, includeKeys2select, matchWithDefault, matchWithResolved, schemaRaw2rawData, separateRawData } from '@/utils/model';
import { err, ok, ResultAsync } from 'neverthrow';
import { match } from 'ts-pattern';
import { z } from 'zod';

/// Metadata ///

const metadata = {
  displayName: '現役生の情報',
  modelName: 'memberActive',
  primaryKeyName: 'memberId',
} as const satisfies ModelMetadata<'memberActive'>;

/// Custom Types ///

export const GRADES = ['B1', 'B2', 'B3', 'B4', 'M1', 'M2', 'D1', 'D2', 'D3'] as const;
export const zGrades = z.enum(GRADES);
export type Grade = ArrayElem<typeof GRADES>;

/// Model Types ///

type Schema = Override<
  SchemaRaw,
  {
    memberId: MemberId;
    grade: Grade;
  }
>;

type IncludeKey = keyof Prisma.MemberActiveInclude;
const includeKeys = ['Member'] as const satisfies IncludeKey[];
const includeKeysRelated = ['MemberActiveInternal', 'MemberActiveExternal'] as const;

interface SchemaResolvedRaw {
  Member: ModelSchemaRawOf<$Member>;
  MemberActiveInternal: Nullable<ModelSchemaRawOf<$MemberActiveInternal>>;
  MemberActiveExternal: Nullable<ModelSchemaRawOf<$MemberActiveExternal>>;
}

type SchemaResolved = {
  _parent: {
    Member: () => BuildModelResult<$Member>;
  };
} & MemberDetailActive;

/// ModelTypes ///

type ModelGen = ModelGenerator<typeof metadata, SchemaRaw, Schema, SchemaResolvedRaw, SchemaResolved>;
type ThisModelImpl<M extends ModelMode = 'DEFAULT'> = Model<M, ModelGen>;
type ThisModel<M extends ModelMode = 'DEFAULT'> = $MemberActive<M>;
interface ThisModelVariants {
  DEFAULT: ThisModel;
  WITH_RESOLVED: ThisModel<'WITH_RESOLVED'>;
}
type RawData = ModelRawData4build<ThisModel>;

/// Normalizer ///

const normalizer = ((client, builder) => ({
  schema: (__raw) => ({
    ...__raw,
    memberId: MemberId.from(__raw.memberId)._unsafeUnwrap(),
    grade: zGrades.parse(__raw.grade),
  }),
  schemaResolved: (__rawResolved) => {
    const { models } = new Database(client);
    const { Member, MemberActiveExternal, MemberActiveInternal } = __rawResolved;

    return {
      _parent: {
        Member: () => buildRawData(models.Member.__build).default(schemaRaw2rawData<$Member>(Member)).build(builder),
      },
      ...toMemberDetailActive(client, builder, { MemberActiveExternal, MemberActiveInternal }),
    };
  },
})) satisfies ModelNormalizer<ThisModel>;

/// Model ///

export class $MemberActive<Mode extends ModelMode = 'DEFAULT'> implements ThisModelImpl<Mode> {
  private dbError = Database.dbErrorWith(metadata);
  private client;
  public declare __struct: ThisModelImpl<Mode>;
  public declare __variants: ThisModelVariants;

  public __raw: SchemaRaw;
  public data: Schema;
  public __rawResolved: ModeWithResolved<Mode, SchemaResolvedRaw>;
  public dataResolved: ModeWithResolved<Mode, SchemaResolved>;

  private constructor(
    public __prisma: PrismaClient,
    { __raw, __rawResolved }: RawData,
    private builder: ModelBuilderType,
  ) {
    const n = normalizer(__prisma, this.builder);

    this.__raw = __raw;
    this.data = n.schema(__raw);
    const { rawResolved, dataResolved } = matchWithResolved<Mode, SchemaResolvedRaw, SchemaResolved>(__rawResolved, n.schemaResolved);
    this.__rawResolved = rawResolved;
    this.dataResolved = dataResolved;
    this.client = __prisma;
  }

  public static with(client: PrismaClient) {
    const __toUnwrappedInstances = ((rawData, builder) => ({
      default: new $MemberActive(client, rawData, builder),
      withResolved: new $MemberActive<'WITH_RESOLVED'>(client, rawData, builder),
    })) satisfies ModelUnwrappedInstances__DO_NOT_EXPOSE<ThisModel>;

    const buildErr = Database.dbErrorWith(metadata).transformBuildModel('toInstances');
    const toInstances = ((rawData, builder) => match(builder)
      .with({ type: 'ANONYMOUS' }, () => err(buildErr({ type: 'PERMISSION_DENIED', detail: { builder } } as const)))
      .with({ type: 'SELF' }, () => ok(__toUnwrappedInstances(rawData, builder)))
      .with({ type: 'MEMBER' }, () => ok(__toUnwrappedInstances(rawData, builder)))
      .exhaustive()
    ) satisfies ModelInstances<ThisModel>;

    const __build = {
      __with: toInstances,
      by: (rawData, memberAsBuilder) => toInstances(rawData, { type: 'MEMBER', member: memberAsBuilder }),
      bySelf: (rawData) => toInstances(rawData, { type: 'SELF' }),
    } satisfies ModelBuilderInternal<ThisModel>;

    return {
      __build,
      from: (memberId: MemberId) => {
        const rawData = Database.transformResult(
          client.memberActive.findUniqueOrThrow({
            where: { memberId },
          }),
        )
          .mapErr(Database.dbErrorWith(metadata).transformPrismaBridge('from'))
          .map(separateRawData<ThisModel, IncludeKey>(includeKeys).default);

        return rawData.map(buildRawData(__build).default);
      },
      fromWithResolved: (memberId: MemberId) => {
        const rFetchedData = ResultAsync.combine([
          Database.transformResult(
            client.memberActive.findUniqueOrThrow({
              where: { memberId },
            }),
          ),
          Database.transformResult(
            client.member.findUniqueOrThrow({
              where: { id: memberId },
              include: includeKeys2select(includeKeysRelated),
            }),
          ),
        ])
          .mapErr(Database.dbErrorWith(metadata).transformPrismaBridge('fromWithResolved'));

        return rFetchedData.map(
          (
            [memberActive, { MemberActiveInternal, MemberActiveExternal, ...Member }],
          ) => buildRawData(__build).withResolved(
            {
              __raw: memberActive,
              __rawResolved: { Member, MemberActiveInternal, MemberActiveExternal },
            },
          ),
        );
      },
      fetchMany: (args) => {
        const rawDataList = Database.transformResult(
          client.memberActive.findMany(args),
        )
          .mapErr(Database.dbErrorWith(metadata).transformPrismaBridge('fetchMany'))
          .map((r) => r.map(separateRawData<ThisModel, IncludeKey>(includeKeys).default));

        return rawDataList.map((ms) => ({
          build: (builder) => ms.map((r) => buildRawData(__build).default(r).build(builder)),
          buildBy: (memberAsBuilder) => ms.map((r) => buildRawData(__build).default(r).buildBy(memberAsBuilder)),
          buildBySelf: () => ms.map((r) => buildRawData(__build).default(r).buildBySelf()),
        }));
      },
      fetchManyWithResolved: (args) => {
        const rFetchedData = ResultAsync.combine([
          Database.transformResult(
            client.memberActive.findMany({
              ...args,
              orderBy: { memberId: 'asc' },
            }),
          ),
          Database.transformResult(
            client.member.findMany({
              orderBy: { id: 'asc' },
              include: includeKeys2select(includeKeysRelated),
            }),
          ),
        ])
          .mapErr(Database.dbErrorWith(metadata).transformPrismaBridge('fetchManyWithResolved'));

        const rawDataList = rFetchedData.map(([memberBase, members]) => {
          const membersMap = new Map<string, SchemaResolvedRaw>();

          members.forEach((m) => {
            const { MemberActiveInternal, MemberActiveExternal, ...Member } = m;
            membersMap.set(m.id, { Member, MemberActiveInternal, MemberActiveExternal });
          });

          return memberBase.map((r) => {
            const resolved = membersMap.get(r.memberId);
            if (resolved == null) throw new Error('不正なデータ: `Member` が取得できませんでした');
            return { __raw: r, __rawResolved: resolved };
          });
        });

        return rawDataList.map((ms) => ({
          build: (builder) => ms.map((r) => buildRawData(__build).withResolved(r).build(builder)),
          buildBy: (memberAsBuilder) => ms.map((r) => buildRawData(__build).withResolved(r).buildBy(memberAsBuilder)),
          buildBySelf: () => ms.map((r) => buildRawData(__build).withResolved(r).buildBySelf()),
        }));
      },
    } satisfies ModelBuilder<ThisModel>;
  }

  public resolveRelation(): ModelResolver<Mode, ThisModel> {
    return matchWithDefault(
      this.__rawResolved,
      () => $MemberActive.with(this.client).fromWithResolved(this.data.memberId),
    );
  }

  public update(data: Partial<Schema>): DatabaseResult<ThisModel> {
    return Database.transformResult(
      this.client.memberActive.update({ data: fillPrismaSkip(data), where: { memberId: this.data.memberId } }),
    )
      .mapErr(this.dbError.transformPrismaBridge('update'))
      .map((r) => buildRawData($MemberActive.with(this.client).__build).default(schemaRaw2rawData<$MemberActive>(r)))
      .map((r) => r.build(this.builder)._unsafeUnwrap());
  }

  public delete(): DatabaseResult<void> {
    return Database.transformResult(
      this.client.memberActive.delete({ where: { memberId: this.data.memberId } }),
    )
      .mapErr(this.dbError.transformPrismaBridge('delete'))
      .map(() => undefined);
  }

  public hoge() { }
}
