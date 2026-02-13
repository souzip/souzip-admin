<template>
  <div class="space-y-6">
    <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="card">
        <div class="text-sm text-gray-500">총 기념품</div>
        <div class="mt-2 text-2xl font-semibold">-</div>
      </div>

      <div class="card">
        <div class="text-sm text-gray-500">등록된 국가</div>
        <div class="mt-2 text-2xl font-semibold">-</div>
      </div>

      <div class="card">
        <div class="text-sm text-gray-500">오늘 등록</div>
        <div class="mt-2 text-2xl font-semibold">-</div>
      </div>
    </section>

    <section class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-semibold">최근 등록</h2>
        <button type="button" class="btn-secondary">새로고침</button>
      </div>

      <div class="table-wrapper">
        <table class="table-base">
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>등록일</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-gray-500">-</td>
              <td class="text-gray-500">-</td>
              <td class="text-gray-500">-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
